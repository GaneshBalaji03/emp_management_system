from django.db import models


class Employee(models.Model):
    """Employee master with lifecycle tracking (ACTIVE / EXITED).
    Mapped to legacy table: emp_master
    """

    emp_id = models.PositiveIntegerField(primary_key=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "emp_master"

    def __str__(self) -> str:
        return str(self.emp_id)


class EmpBankInfo(models.Model):
    emp_bank_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey(Employee, models.DO_NOTHING, db_column='emp_id', related_name='bank_info')
    bank_acct_no = models.CharField(unique=True, max_length=20)
    ifsc_code = models.CharField(max_length=11)
    branch_name = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'emp_bank_info'


class EmpRegInfo(models.Model):
    emp_reg_info_id = models.PositiveIntegerField(primary_key=True)
    emp = models.OneToOneField(Employee, models.DO_NOTHING, db_column='emp_id', related_name='reg_info')
    pan = models.CharField(unique=True, max_length=10)
    aadhaar = models.CharField(unique=True, max_length=12)
    uan_epf_acctno = models.CharField(unique=True, max_length=20)
    esi = models.CharField(unique=True, max_length=25)

    class Meta:
        managed = False
        db_table = 'emp_reg_info'


class EmpCtcInfo(models.Model):
    emp_ctc_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey(Employee, models.DO_NOTHING, db_column='emp_id', related_name='ctc_history')
    int_title = models.CharField(max_length=30)
    ext_title = models.CharField(max_length=60)
    main_level = models.PositiveIntegerField()
    sub_level = models.CharField(max_length=1)
    start_of_ctc = models.DateField()
    end_of_ctc = models.DateField(blank=True, null=True)
    ctc_amt = models.PositiveIntegerField()

    class Meta:
        managed = False
        db_table = 'emp_ctc_info'


class EmpComplianceTracker(models.Model):
    emp_compliance_tracker_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey(Employee, models.DO_NOTHING, db_column='emp_id', related_name='compliance_records')
    comp_type = models.CharField(max_length=60)
    status = models.CharField(max_length=20)
    doc_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'emp_compliance_tracker'
