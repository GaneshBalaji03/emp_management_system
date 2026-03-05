from django.urls import path
from .views import (
    EmployeeCreateView, EmployeeExitView, EmployeeListView,
    EmployeeUpdateView, EmployeeProfileView, OnboardingStatusUpdateView,
    CtcRecordView, DocumentView, DocumentVerifyView,
    HeadcountReportView, JoinersLeaversReportView, CtcDistributionView,
    ComplianceDashboardView, AlertsView, ComplianceStatusReportView,
)

urlpatterns = [
    # Employee CRUD
    path("", EmployeeListView.as_view(), name="employee_list"),
    path("create", EmployeeCreateView.as_view(), name="employee_create"),
    path("<str:emp_id>/update", EmployeeUpdateView.as_view(), name="employee_update"),
    path("<str:emp_id>/exit", EmployeeExitView.as_view(), name="employee_exit"),
    path("<str:emp_id>/delete", EmployeeUpdateView.as_view(), name="employee_delete"),
    path("<str:emp_id>/profile", EmployeeProfileView.as_view(), name="employee_profile"),

    # Onboarding
    path("onboarding/tracker/<str:tracker_id>", OnboardingStatusUpdateView.as_view(), name="onboarding_update"),

    # CTC / Role Change
    path("<str:emp_id>/ctc", CtcRecordView.as_view(), name="ctc_records"),

    # Documents
    path("<str:emp_id>/documents", DocumentView.as_view(), name="documents"),
    path("documents/<str:doc_id>/verify", DocumentVerifyView.as_view(), name="document_verify"),

    # Reports
    path("reports/headcount", HeadcountReportView.as_view(), name="headcount_report"),
    path("reports/joiners-leavers", JoinersLeaversReportView.as_view(), name="joiners_leavers_report"),
    path("reports/ctc-distribution", CtcDistributionView.as_view(), name="ctc_distribution"),

    # Compliance
    path("reports/compliance-dashboard", ComplianceDashboardView.as_view(), name="compliance_dashboard"),
    path("reports/compliance-status", ComplianceStatusReportView.as_view(), name="compliance_status"),

    # Alerts
    path("alerts", AlertsView.as_view(), name="alerts"),
]
