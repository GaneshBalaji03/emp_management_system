import json
import datetime
from django.http import HttpRequest, JsonResponse
from django.utils.dateparse import parse_date
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q

from hackathon.auth import ExternalAuthError, load_signed_session
from .models import Employee, EmpBankInfo, EmpRegInfo, EmpCtcInfo, EmpComplianceTracker


def _get_bearer_token(request: HttpRequest) -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    prefix = "Bearer "
    if not auth_header.startswith(prefix):
        return None
    token = auth_header[len(prefix):].strip()
    return token or None


def _require_session(request: HttpRequest) -> tuple[dict | None, JsonResponse | None]:
    token = _get_bearer_token(request)
    if not token:
        return None, JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        payload = load_signed_session(token)
        return payload, None
    except ExternalAuthError:
        return None, JsonResponse({"error": "Unauthorized"}, status=401)


def _json_body(request: HttpRequest) -> dict:
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}


def _missing_fields(payload: dict, fields: list[str]) -> list[str]:
    missing = []
    for f in fields:
        v = payload.get(f)
        if v is None or (isinstance(v, str) and not v.strip()):
            missing.append(f)
    return missing


@method_decorator(csrf_exempt, name="dispatch")
class EmployeeListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Temporarily disabled authentication for development
        # _session, error = _require_session(request)
        # if error:
        #     return error

        status_filter = (request.GET.get("status") or "").strip().upper() or None
        search_query = (request.GET.get("search") or "").strip()

        qs = Employee.objects.all()

        if search_query:
            if search_query.isdigit():
                qs = qs.filter(Q(emp_id=int(search_query)) | Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query))
            else:
                qs = qs.filter(Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query) | Q(middle_name__icontains=search_query))

        today = datetime.date.today()
        data = []
        for emp in qs:
            emp_status = "ACTIVE"
            if emp.end_date and emp.end_date <= today:
                emp_status = "EXITED"

            if status_filter and status_filter != "ALL" and emp_status != status_filter:
                continue

            data.append({
                "emp_id": emp.emp_id,
                "first_name": emp.first_name,
                "middle_name": emp.middle_name,
                "last_name": emp.last_name,
                "start_date": emp.start_date.isoformat() if emp.start_date else None,
                "end_date": emp.end_date.isoformat() if emp.end_date else None,
                "status": emp_status
            })

        return JsonResponse(data, safe=False)


@method_decorator(csrf_exempt, name="dispatch")
class EmployeeCreateView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)

        missing = _missing_fields(payload, ["emp_id", "first_name", "last_name", "start_date"])
        if missing:
            return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)

        try:
            emp_id = int(payload.get("emp_id"))
        except (ValueError, TypeError):
            return JsonResponse({"error": "Employee ID must be a number"}, status=400)

        first_name = str(payload.get("first_name", "")).strip()
        middle_name = str(payload.get("middle_name", "")).strip() or None
        last_name = str(payload.get("last_name", "")).strip()
        start_date_raw = str(payload.get("start_date", "")).strip()

        start_date = parse_date(start_date_raw)
        if not start_date:
            return JsonResponse({"error": "Invalid start_date. Use YYYY-MM-DD."}, status=400)

        if Employee.objects.filter(emp_id=emp_id).exists():
            return JsonResponse({"error": "Employee ID already exists"}, status=400)

        Employee.objects.create(
            emp_id=emp_id,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            start_date=start_date,
        )

        return JsonResponse({"ok": True, "message": "Employee created"}, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class EmployeeUpdateView(View):
    def put(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)

        try:
            employee = Employee.objects.get(emp_id=emp_id)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        today = datetime.date.today()
        if employee.end_date and employee.end_date <= today:
            return JsonResponse({"error": "Cannot update an exited employee"}, status=400)

        for field in ["first_name", "middle_name", "last_name", "start_date"]:
            if field in payload:
                value = payload.get(field)
                if field == "start_date" and value:
                    value = parse_date(value)
                elif isinstance(value, str):
                    value = value.strip()
                setattr(employee, field, value or None)

        employee.save()
        return JsonResponse({"ok": True, "message": "Employee updated"}, status=200)

    def delete(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        from django.db import connection
        
        # Clean the ID to ensure it matches the integer in the DB
        clean_id = emp_id.strip()
        
        try:
            # We use raw SQL to ensure the command is sent directly to the legacy table
            with connection.cursor() as cursor:
                # Delete related records first to avoid foreign key constraints
                # Some tables might not exist or be empty, which is fine
                cursor.execute("DELETE FROM emp_bank_info WHERE emp_id = %s", [clean_id])
                cursor.execute("DELETE FROM emp_reg_info WHERE emp_id = %s", [clean_id])
                cursor.execute("DELETE FROM emp_ctc_info WHERE emp_id = %s", [clean_id])
                cursor.execute("DELETE FROM emp_compliance_tracker WHERE emp_id = %s", [clean_id])
                
                # Delete the master record
                cursor.execute("DELETE FROM emp_master WHERE emp_id = %s", [clean_id])
                
                # Verify if any row was actually deleted from the master table
                if cursor.rowcount == 0:
                    return JsonResponse({"error": f"Employee {clean_id} not found or already deleted."}, status=404)
                
            return JsonResponse({"ok": True, "message": "Employee deleted permanently"}, status=200)
        except Exception as e:
            return JsonResponse({"error": f"Failed to delete: {str(e)}"}, status=500)


@method_decorator(csrf_exempt, name="dispatch")
class EmployeeExitView(View):
    def put(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)
        exit_date_raw = str(payload.get("exit_date", "")).strip()
        if not exit_date_raw:
            return JsonResponse({"error": "exit_date is required. Use YYYY-MM-DD."}, status=400)

        exit_date = parse_date(exit_date_raw)
        if not exit_date:
            return JsonResponse({"error": "Invalid exit_date. Use YYYY-MM-DD."}, status=400)

        try:
            employee = Employee.objects.get(emp_id=emp_id)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        today = datetime.date.today()
        if employee.end_date and employee.end_date <= today:
            return JsonResponse({"error": "Employee already exited"}, status=400)

        if employee.start_date and exit_date < employee.start_date:
            return JsonResponse({"error": "exit_date cannot be before start_date"}, status=400)

        employee.end_date = exit_date
        employee.save()
        return JsonResponse({"ok": True, "message": "Employee exited"}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class EmployeeProfileView(View):
    def get(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        try:
            emp = Employee.objects.get(emp_id=emp_id)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        today = datetime.date.today()
        emp_status = "ACTIVE"
        if emp.end_date and emp.end_date <= today:
            emp_status = "EXITED"

        personal = {
            "emp_id": emp.emp_id,
            "first_name": emp.first_name,
            "middle_name": emp.middle_name,
            "last_name": emp.last_name,
            "start_date": emp.start_date.isoformat() if emp.start_date else None,
            "end_date": emp.end_date.isoformat() if emp.end_date else None,
            "status": emp_status
        }

        # Bank Info
        bank = list(emp.bank_info.values())

        # Reg Info
        try:
            reg_obj = emp.reg_info
            reg = {
                "pan": reg_obj.pan,
                "aadhaar": reg_obj.aadhaar,
                "uan_epf_acctno": reg_obj.uan_epf_acctno,
                "esi": reg_obj.esi
            }
        except EmpRegInfo.DoesNotExist:
            reg = None

        # CTC History
        ctc = list(emp.ctc_history.order_by("-start_of_ctc").values())

        # Compliance / Onboarding
        compliance = list(emp.compliance_records.values())

        return JsonResponse({
            "personal": personal,
            "bank": bank,
            "reg": reg,
            "ctc": ctc,
            "compliance": compliance
        })


@method_decorator(csrf_exempt, name="dispatch")
class OnboardingStatusUpdateView(View):
    def put(self, request: HttpRequest, tracker_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)
        status = str(payload.get("status", "")).strip().upper()
        if status not in {"PENDING", "COMPLETED", "IN PROGRESS"}:
            return JsonResponse({"error": "Invalid status"}, status=400)

        try:
            tracker = EmpComplianceTracker.objects.get(emp_compliance_tracker_id=tracker_id)
            tracker.status = status
            tracker.save()
            return JsonResponse({"ok": True, "message": "Status updated"})
        except EmpComplianceTracker.DoesNotExist:
            return JsonResponse({"error": "Tracker not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


# ──────────────────────────────────────────────
# Job/Role Change Tracking (CTC Records)
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class CtcRecordView(View):
    """GET: list CTC records for employee. POST: add a new CTC record."""

    def get(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error
        records = list(
            EmpCtcInfo.objects.filter(emp_id=emp_id)
            .order_by("-start_of_ctc")
            .values()
        )
        return JsonResponse(records, safe=False)

    def post(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)
        required = ["int_title", "ext_title", "main_level", "sub_level", "start_of_ctc", "ctc_amt"]
        missing = _missing_fields(payload, required)
        if missing:
            return JsonResponse({"error": f"Missing: {', '.join(missing)}"}, status=400)

        try:
            Employee.objects.get(emp_id=emp_id)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        start = parse_date(str(payload["start_of_ctc"]))
        end = parse_date(str(payload.get("end_of_ctc", "") or "")) if payload.get("end_of_ctc") else None
        if not start:
            return JsonResponse({"error": "Invalid start_of_ctc"}, status=400)

        # Overlap check
        overlap_qs = EmpCtcInfo.objects.filter(emp_id=emp_id, start_of_ctc__lte=start)
        if end:
            overlap_qs = overlap_qs.filter(Q(end_of_ctc__gte=start) | Q(end_of_ctc__isnull=True))
        else:
            overlap_qs = overlap_qs.filter(end_of_ctc__isnull=True)
        if overlap_qs.exists():
            # Close the previous open record
            prev = EmpCtcInfo.objects.filter(emp_id=emp_id, end_of_ctc__isnull=True).first()
            if prev and prev.start_of_ctc < start:
                prev.end_of_ctc = start
                prev.save()

        # Auto-generate pk
        max_id = EmpCtcInfo.objects.order_by("-emp_ctc_id").values_list("emp_ctc_id", flat=True).first() or 0
        EmpCtcInfo.objects.create(
            emp_ctc_id=max_id + 1,
            emp_id=emp_id,
            int_title=payload["int_title"],
            ext_title=payload["ext_title"],
            main_level=int(payload["main_level"]),
            sub_level=str(payload["sub_level"]),
            start_of_ctc=start,
            end_of_ctc=end,
            ctc_amt=int(payload["ctc_amt"]),
        )
        return JsonResponse({"ok": True, "message": "CTC record added"}, status=201)


# ──────────────────────────────────────────────
# Document Upload & Verification
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class DocumentView(View):
    """GET: list documents. POST: add a document record."""

    def get(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error
        docs = list(
            EmpComplianceTracker.objects.filter(emp_id=emp_id).values()
        )
        return JsonResponse(docs, safe=False)

    def post(self, request: HttpRequest, emp_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)
        missing = _missing_fields(payload, ["comp_type"])
        if missing:
            return JsonResponse({"error": "comp_type is required"}, status=400)

        try:
            Employee.objects.get(emp_id=emp_id)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        max_id = EmpComplianceTracker.objects.order_by("-emp_compliance_tracker_id").values_list("emp_compliance_tracker_id", flat=True).first() or 0
        EmpComplianceTracker.objects.create(
            emp_compliance_tracker_id=max_id + 1,
            emp_id=emp_id,
            comp_type=str(payload["comp_type"]).strip(),
            status=str(payload.get("status", "PENDING")).strip().upper(),
            doc_url=str(payload.get("doc_url", "")).strip() or None,
        )
        return JsonResponse({"ok": True, "message": "Document record added"}, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class DocumentVerifyView(View):
    """PUT: update status + doc_url."""

    def put(self, request: HttpRequest, doc_id: str) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        payload = _json_body(request)
        try:
            doc = EmpComplianceTracker.objects.get(emp_compliance_tracker_id=doc_id)
        except EmpComplianceTracker.DoesNotExist:
            return JsonResponse({"error": "Document not found"}, status=404)

        if "status" in payload:
            s = str(payload["status"]).strip().upper()
            if s not in {"PENDING", "VERIFIED", "COMPLETED", "IN PROGRESS", "REJECTED"}:
                return JsonResponse({"error": "Invalid status"}, status=400)
            doc.status = s
        if "doc_url" in payload:
            doc.doc_url = str(payload["doc_url"]).strip() or None

        doc.save()
        return JsonResponse({"ok": True, "message": "Document updated"})


# ──────────────────────────────────────────────
# Headcount Report
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class HeadcountReportView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Temporarily disabled authentication for development
        # _session, error = _require_session(request)
        # if error:
        #     return error

        today = datetime.date.today()
        total = Employee.objects.count()
        active = 0
        exited = 0
        for emp in Employee.objects.all():
            if emp.end_date and emp.end_date <= today:
                exited += 1
            else:
                active += 1

        return JsonResponse({
            "total": total,
            "active": active,
            "exited": exited,
            "as_of": today.isoformat()
        })


# ──────────────────────────────────────────────
# Joiners & Leavers Report
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class JoinersLeaversReportView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Temporarily disabled authentication for development
        # _session, error = _require_session(request)
        # if error:
        #     return error

        months_data = {}
        for emp in Employee.objects.all():
            if emp.start_date:
                key = emp.start_date.strftime("%Y-%m")
                months_data.setdefault(key, {"month": key, "joiners": 0, "leavers": 0})
                months_data[key]["joiners"] += 1
            if emp.end_date:
                key = emp.end_date.strftime("%Y-%m")
                months_data.setdefault(key, {"month": key, "joiners": 0, "leavers": 0})
                months_data[key]["leavers"] += 1

        result = sorted(months_data.values(), key=lambda x: x["month"], reverse=True)
        return JsonResponse(result, safe=False)


# ──────────────────────────────────────────────
# CTC & Level Distribution Analytics
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class CtcDistributionView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Temporarily disabled authentication for development
        # _session, error = _require_session(request)
        # if error:
        #     return error

        # Get latest CTC record per employee (the one with no end_of_ctc or latest start)
        bands = {"0-3L": 0, "3-6L": 0, "6-10L": 0, "10-15L": 0, "15-25L": 0, "25L+": 0}
        levels = {}
        records = EmpCtcInfo.objects.order_by("emp_id", "-start_of_ctc")
        seen = set()
        for r in records:
            if r.emp_id in seen:
                continue
            seen.add(r.emp_id)
            amt = r.ctc_amt or 0
            if amt < 300000:
                bands["0-3L"] += 1
            elif amt < 600000:
                bands["3-6L"] += 1
            elif amt < 1000000:
                bands["6-10L"] += 1
            elif amt < 1500000:
                bands["10-15L"] += 1
            elif amt < 2500000:
                bands["15-25L"] += 1
            else:
                bands["25L+"] += 1
            lv = f"L{r.main_level}{r.sub_level}"
            levels[lv] = levels.get(lv, 0) + 1

        return JsonResponse({
            "salary_bands": bands,
            "level_distribution": levels
        })


# ──────────────────────────────────────────────
# Compliance Dashboard
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class ComplianceDashboardView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        all_records = EmpComplianceTracker.objects.all()
        total = all_records.count()
        completed = all_records.filter(status="COMPLETED").count()
        verified = all_records.filter(status="VERIFIED").count()
        pending = all_records.filter(status="PENDING").count()
        in_progress = all_records.filter(status="IN PROGRESS").count()
        missing_doc = all_records.filter(Q(doc_url__isnull=True) | Q(doc_url="")).count()

        # Per-employee summary
        emp_summary = []
        emps_with_records = set(all_records.values_list("emp_id", flat=True))
        all_emps = set(Employee.objects.values_list("emp_id", flat=True))
        emps_without = all_emps - emps_with_records

        for eid in emps_with_records:
            recs = all_records.filter(emp_id=eid)
            emp_summary.append({
                "emp_id": eid,
                "total": recs.count(),
                "completed": recs.filter(Q(status="COMPLETED") | Q(status="VERIFIED")).count(),
                "pending": recs.filter(status="PENDING").count(),
                "missing_doc": recs.filter(Q(doc_url__isnull=True) | Q(doc_url="")).count(),
            })

        return JsonResponse({
            "metrics": {
                "total_records": total,
                "completed": completed + verified,
                "pending": pending,
                "in_progress": in_progress,
                "missing_documents": missing_doc,
                "employees_without_records": len(emps_without),
            },
            "employee_summary": emp_summary
        })


# ──────────────────────────────────────────────
# Alerts & Reminders
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class AlertsView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        alerts = []
        # Pending compliance records
        pending = EmpComplianceTracker.objects.filter(status="PENDING")
        for p in pending:
            try:
                emp = Employee.objects.get(emp_id=p.emp_id)
                name = f"{emp.first_name} {emp.last_name}"
            except Employee.DoesNotExist:
                name = f"Emp #{p.emp_id}"
            alerts.append({
                "id": p.emp_compliance_tracker_id,
                "type": "PENDING_DOCUMENT",
                "severity": "warning",
                "message": f"{name}: '{p.comp_type}' is pending verification",
                "emp_id": p.emp_id,
                "comp_type": p.comp_type,
            })

        # Missing documents
        missing = EmpComplianceTracker.objects.filter(Q(doc_url__isnull=True) | Q(doc_url=""))
        for m in missing:
            try:
                emp = Employee.objects.get(emp_id=m.emp_id)
                name = f"{emp.first_name} {emp.last_name}"
            except Employee.DoesNotExist:
                name = f"Emp #{m.emp_id}"
            alerts.append({
                "id": m.emp_compliance_tracker_id,
                "type": "MISSING_DOCUMENT",
                "severity": "danger",
                "message": f"{name}: No document uploaded for '{m.comp_type}'",
                "emp_id": m.emp_id,
                "comp_type": m.comp_type,
            })

        # In-progress items
        in_prog = EmpComplianceTracker.objects.filter(status="IN PROGRESS")
        for ip in in_prog:
            try:
                emp = Employee.objects.get(emp_id=ip.emp_id)
                name = f"{emp.first_name} {emp.last_name}"
            except Employee.DoesNotExist:
                name = f"Emp #{ip.emp_id}"
            alerts.append({
                "id": ip.emp_compliance_tracker_id,
                "type": "IN_PROGRESS",
                "severity": "info",
                "message": f"{name}: '{ip.comp_type}' verification in progress",
                "emp_id": ip.emp_id,
                "comp_type": ip.comp_type,
            })

        return JsonResponse(alerts, safe=False)


# ──────────────────────────────────────────────
# Compliance Status Report
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class ComplianceStatusReportView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        _session, error = _require_session(request)
        if error:
            return error

        status_filter = (request.GET.get("status") or "").strip().upper()
        type_filter = (request.GET.get("type") or "").strip()

        qs = EmpComplianceTracker.objects.all()
        if status_filter:
            qs = qs.filter(status=status_filter)
        if type_filter:
            qs = qs.filter(comp_type__icontains=type_filter)

        data = []
        for rec in qs:
            try:
                emp = Employee.objects.get(emp_id=rec.emp_id)
                name = f"{emp.first_name} {emp.last_name}"
            except Employee.DoesNotExist:
                name = f"Emp #{rec.emp_id}"
            data.append({
                "emp_compliance_tracker_id": rec.emp_compliance_tracker_id,
                "emp_id": rec.emp_id,
                "employee_name": name,
                "comp_type": rec.comp_type,
                "status": rec.status,
                "doc_url": rec.doc_url,
            })

        return JsonResponse(data, safe=False)
