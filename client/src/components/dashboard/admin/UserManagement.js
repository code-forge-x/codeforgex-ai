import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = '/api/users';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '', status: 'active' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('-createdAt');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter,
        role: roleFilter,
        sort
      });
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, rowsPerPage, search, statusFilter, roleFilter, sort]);

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(user ? { name: user.name, email: user.email, role: user.role || 'user', password: '', status: user.status } : { name: '', email: '', role: 'user', password: '', status: 'active' });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editUser ? 'PUT' : 'POST';
      const url = editUser ? `${API_URL}/${editUser._id}` : API_URL;
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (!editUser && form.password) payload.password = form.password;
      if (editUser && form.password) payload.password = form.password;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save user');
      setSnackbar({ open: true, message: 'User saved successfully', severity: 'success' });
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
    setDeleteId(null);
  };

  const handleSort = (field) => {
    if (sort === field) setSort('-' + field);
    else if (sort === '-' + field) setSort(field);
    else setSort(field);
  };

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#181818' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0, pt: 2 }}>
        <Typography variant="h5" sx={{ color: '#fff' }}>User Management</Typography>
        <Button variant="contained" sx={{ bgcolor: '#ff9800', color: '#fff', fontWeight: 600 }} onClick={() => handleOpenDialog()}>Create User</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, px: 0 }}>
        <TextField
          placeholder="Search by name or email"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#bbb' }} />
              </InputAdornment>
            ),
            sx: { bgcolor: '#232323', color: '#fff', borderRadius: 2 }
          }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          size="small"
          SelectProps={{ native: true }}
          sx={{ minWidth: 120, bgcolor: '#232323', color: '#fff', borderRadius: 2 }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </TextField>
        <TextField
          select
          label="Role"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
          size="small"
          SelectProps={{ native: true }}
          sx={{ minWidth: 120, bgcolor: '#232323', color: '#fff', borderRadius: 2 }}
        >
          <option value="">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
        </TextField>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#181818', px: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress sx={{ color: '#ff9800' }} /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
          <TableContainer component={Paper} sx={{ bgcolor: '#232323', flex: 1, boxShadow: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#bbb', cursor: 'pointer' }} onClick={() => handleSort('email')}>Email</TableCell>
                  <TableCell sx={{ color: '#bbb', cursor: 'pointer' }} onClick={() => handleSort('name')}>Name</TableCell>
                  <TableCell sx={{ color: '#bbb', cursor: 'pointer' }} onClick={() => handleSort('role')}>Role</TableCell>
                  <TableCell sx={{ color: '#bbb', cursor: 'pointer' }} onClick={() => handleSort('status')}>Status</TableCell>
                  <TableCell sx={{ color: '#bbb', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>Created On</TableCell>
                  <TableCell sx={{ color: '#bbb' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell sx={{ 
                      color: '#fff',
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                    }}>
                      {user.email}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#fff',
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                    }}>
                      {user.name}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#fff',
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                    }}>
                      {user.role}
                    </TableCell>
                    <TableCell sx={{ 
                      color: user.status === 'inactive' ? '#f44336' : '#4caf50',
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                    }}>
                      {user.status || 'active'}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#fff',
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                    }}>
                      {new Date(user.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: user.role === 'admin' ? 'rgba(255, 152, 0, 0.1)' : 'transparent'
                    }}>
                      <IconButton onClick={() => handleOpenDialog(user)}><EditIcon sx={{ color: '#ff9800' }} /></IconButton>
                      <IconButton onClick={() => setDeleteId(user._id)}><DeleteIcon sx={{ color: '#f44336' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ bgcolor: '#232323', color: '#fff' }}
          />
          </>
        )}
      </Box>
      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} fullWidth required />
          <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} fullWidth required type="email" />
          <TextField label="Role" name="role" value={form.role} onChange={handleFormChange} fullWidth select SelectProps={{ native: true }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
          </TextField>
          <TextField label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth select SelectProps={{ native: true }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </TextField>
          <TextField label="Password" name="password" value={form.password} onChange={handleFormChange} fullWidth type="password" required={!editUser} helperText={editUser ? 'Leave blank to keep current password' : ''} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#ff9800', color: '#fff' }}>{editUser ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default UserManagement; 