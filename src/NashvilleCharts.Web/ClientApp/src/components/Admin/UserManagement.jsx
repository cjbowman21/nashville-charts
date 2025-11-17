import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Badge, Alert, Spinner } from 'react-bootstrap'
import { adminApi } from '../../services/api'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [editForm, setEditForm] = useState({ displayName: '', email: '' })
  const [newPassword, setNewPassword] = useState('')
  const [roleName, setRoleName] = useState('Admin')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAllUsers({ pageSize: 100 })
      setUsers(response.data.users)
      setError('')
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setEditForm({ displayName: user.displayName, email: user.email })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    try {
      await adminApi.updateUser(selectedUser.id, editForm)
      setSuccess('User updated successfully')
      setShowEditModal(false)
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update user: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowResetPasswordModal(true)
  }

  const handleSubmitPasswordReset = async () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      await adminApi.resetPassword(selectedUser.id, newPassword)
      setSuccess('Password reset successfully')
      setShowResetPasswordModal(false)
      setNewPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to reset password: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleManageRoles = (user) => {
    setSelectedUser(user)
    setRoleName('Admin')
    setShowRoleModal(true)
  }

  const handleAssignRole = async () => {
    try {
      await adminApi.assignRole(selectedUser.id, roleName)
      setSuccess(`Role '${roleName}' assigned successfully`)
      setShowRoleModal(false)
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to assign role: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleRemoveRole = async (userId, role) => {
    if (!window.confirm(`Remove role '${role}' from this user?`)) return

    try {
      await adminApi.removeRole(userId, role)
      setSuccess(`Role '${role}' removed successfully`)
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to remove role: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleLockUser = async (userId) => {
    if (!window.confirm('Lock this user account?')) return

    try {
      await adminApi.lockUser(userId)
      setSuccess('User locked successfully')
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to lock user: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleUnlockUser = async (userId) => {
    try {
      await adminApi.unlockUser(userId)
      setSuccess('User unlocked successfully')
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to unlock user: ' + (err.response?.data?.error || err.message))
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading users...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>User Management</h3>
        <Button variant="primary" size="sm" onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Roles</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.displayName}</td>
              <td>
                {user.roles.map(role => (
                  <Badge
                    key={role}
                    bg="primary"
                    className="me-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveRole(user.id, role)}
                    title="Click to remove"
                  >
                    {role} ×
                  </Badge>
                ))}
                {user.roles.length === 0 && <span className="text-muted">No roles</span>}
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
              <td>
                {user.lockoutEnd && new Date(user.lockoutEnd) > new Date() ? (
                  <Badge bg="danger">Locked</Badge>
                ) : (
                  <Badge bg="success">Active</Badge>
                )}
              </td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline-primary" onClick={() => handleEdit(user)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={() => handleResetPassword(user)}>
                    Reset Pwd
                  </Button>
                  <Button size="sm" variant="outline-info" onClick={() => handleManageRoles(user)}>
                    Add Role
                  </Button>
                  {user.lockoutEnd && new Date(user.lockoutEnd) > new Date() ? (
                    <Button size="sm" variant="outline-success" onClick={() => handleUnlockUser(user.id)}>
                      Unlock
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-warning" onClick={() => handleLockUser(user.id)}>
                      Lock
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {users.length === 0 && (
        <Alert variant="info">No users found.</Alert>
      )}

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <Form.Text className="text-muted">
                Changing email will require re-confirmation
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
              <Form.Text className="text-muted">
                Must be at least 8 characters with uppercase, lowercase, and digit
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitPasswordReset}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manage Roles Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Admin, Moderator"
              />
              <Form.Text className="text-muted">
                Common roles: Admin, Moderator, Editor
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignRole}>
            Assign Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserManagement
