import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import client from "../../services/restClient";
import "./EmailRolesManagement.css";

const EmailRolesManagement = (props) => {
  const [emailRoles, setEmailRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    email: "",
    role: "user",
    isActive: true
  });

  const roleOptions = [
    { label: "User", value: "user" },
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Supervisor", value: "supervisor" }
  ];

  useEffect(() => {
    loadEmailRoles();
  }, []);

  const loadEmailRoles = async () => {
    setLoading(true);
    try {
      const result = await client.service("emailRoles").find({
        query: {
          $sort: { createdAt: -1 }
        }
      });
      setEmailRoles(result.data || []);
    } catch (error) {
      console.error("Error loading email roles:", error);
      setToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to load email roles",
        life: 3000
      });
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingRole(null);
    setFormData({
      email: "",
      role: "user",
      isActive: true
    });
    setShowDialog(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      email: role.email,
      role: role.role,
      isActive: role.isActive
    });
    setShowDialog(true);
  };

  const handleDelete = async (role) => {
    try {
      await client.service("emailRoles").remove(role._id);
      setToast({
        severity: "success",
        summary: "Success",
        detail: "Email role deleted successfully",
        life: 3000
      });
      loadEmailRoles();
    } catch (error) {
      console.error("Error deleting email role:", error);
      setToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete email role",
        life: 3000
      });
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.role) {
      setToast({
        severity: "error",
        summary: "Validation Error",
        detail: "Please fill in all required fields",
        life: 3000
      });
      return;
    }

    try {
      if (editingRole) {
        // Update existing role
        await client.service("emailRoles").patch(editingRole._id, {
          ...formData,
          updatedAt: new Date()
        });
        setToast({
          severity: "success",
          summary: "Success",
          detail: "Email role updated successfully",
          life: 3000
        });
      } else {
        // Create new role
        await client.service("emailRoles").create({
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setToast({
          severity: "success",
          summary: "Success",
          detail: "Email role created successfully",
          life: 3000
        });
      }
      
      setShowDialog(false);
      loadEmailRoles();
    } catch (error) {
      console.error("Error saving email role:", error);
      setToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to save email role",
        life: 3000
      });
    }
  };

  const actionTemplate = (rowData) => (
    <div className="action-buttons">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm"
        onClick={() => handleEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData)}
        tooltip="Delete"
      />
    </div>
  );

  const statusTemplate = (rowData) => (
    <span className={`status-badge ${rowData.isActive ? 'active' : 'inactive'}`}>
      {rowData.isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const roleTemplate = (rowData) => (
    <span className={`role-badge ${rowData.role}`}>
      {rowData.role.toUpperCase()}
    </span>
  );

  return (
    <div className="email-roles-management">
      <Toast ref={toast} />
      
      <div className="page-header">
        <h2>Email Roles Management</h2>
        <p>Manage which emails get which roles when users sign in</p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>Email Role Assignments</h3>
          <Button
            label="Add New Email Role"
            icon="pi pi-plus"
            onClick={handleAddNew}
            className="add-button"
          />
        </div>

        <DataTable
          value={emailRoles}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="email-roles-table"
          emptyMessage="No email roles found"
        >
          <Column field="email" header="Email" sortable />
          <Column field="role" header="Role" body={roleTemplate} sortable />
          <Column field="isActive" header="Status" body={statusTemplate} sortable />
          <Column field="createdAt" header="Created" sortable>
            {rowData => new Date(rowData.createdAt).toLocaleDateString()}
          </Column>
          <Column header="Actions" body={actionTemplate} style={{ width: '100px' }} />
        </DataTable>
      </div>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editingRole ? "Edit Email Role" : "Add New Email Role"}
        modal
        className="email-role-dialog"
        footer={
          <div className="dialog-footer">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSave}
              className="save-button"
            />
          </div>
        }
      >
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <InputText
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <Dropdown
              id="role"
              value={formData.role}
              options={roleOptions}
              onChange={(e) => setFormData({...formData, role: e.value})}
              placeholder="Select role"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.checked})}
              />
              <label htmlFor="isActive">Active</label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const mapState = (state) => {
  const { user } = state.auth;
  return { user };
};

const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(EmailRolesManagement); 