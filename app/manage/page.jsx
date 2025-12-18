'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Switch,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Users,
  Pencil,
  Trash,
  Plus,
  MagnifyingGlass,
  FloppyDisk,
  Key,
  ArrowClockwise,
  Gear,
  Buildings,
  UsersThree,
  MapPin,
} from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';

// ============ HELPER COMPONENTS ============

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

function ActiveChip({ isActive }) {
  return (
    <Chip
      size='small'
      label={isActive ? 'Active' : 'Inactive'}
      color={isActive ? 'success' : 'default'}
    />
  );
}

function ConfigTable({ title, data, columns, onAdd, onEdit, onDelete, loading, entityName }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 600 }}>{title} ({data.length})</Typography>
        <Button variant='contained' startIcon={<Plus size={18} />} onClick={onAdd}
          sx={{ bgcolor: colors.light.primaryHex, '&:hover': { bgcolor: colors.light.primaryHex, opacity: 0.9 } }}>
          Add {entityName}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : data.length === 0 ? (
        <Alert severity='info'>No {entityName.toLowerCase()}s found.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 400 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontWeight: 'bold', bgcolor: colors.light.mutedHex }}>{col.label}</TableCell>
                ))}
                <TableCell sx={{ fontWeight: 'bold', bgcolor: colors.light.mutedHex, width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item._id} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render ? col.render(item[col.key], item) : item[col.key]}</TableCell>
                  ))}
                  <TableCell>
                    <Stack direction='row' spacing={0.5}>
                      <IconButton size='small' onClick={() => onEdit(item)}><Pencil size={16} /></IconButton>
                      <IconButton size='small' color='error' onClick={() => onDelete(item)}><Trash size={16} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
      }
    </Box >
  );
}

// ============ MAIN COMPONENT ============

export default function Manage() {
  const { data: session, status } = useSession();
  const [mainTab, setMainTab] = useState(0);
  const [configTab, setConfigTab] = useState(0);

  // ---- User Management State ----
  const [userTab, setUserTab] = useState(0);
  const [name, setName] = useState('');
  const [fetchEMail, setFetchEmail] = useState('');
  const [currSoc, setCurrSoc] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [dept, setDept] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userFetched, setUserFetched] = useState(false);
  const [userErrors, setUserErrors] = useState({});

  // ---- Config Management State ----
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [parentBlocks, setParentBlocks] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState({ colleges: true, departments: true, societies: true, clubs: true, blocks: true });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ---- Fetch Config Data on Mount ----
  useEffect(() => {
    if (mainTab === 1) {
      fetchAllConfig();
    }
  }, [mainTab]);

  const fetchAllConfig = () => {
    fetchColleges();
    fetchDepartments();
    fetchSocieties();
    fetchClubs();
    fetchParentBlocks();
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/config/colleges?active=false');
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch { toast.error('Failed to fetch colleges'); }
    finally { setLoadingConfig(prev => ({ ...prev, colleges: false })); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/config/departments?active=false');
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch { toast.error('Failed to fetch departments'); }
    finally { setLoadingConfig(prev => ({ ...prev, departments: false })); }
  };

  const fetchSocieties = async () => {
    try {
      const res = await fetch('/api/config/societies?active=false');
      const data = await res.json();
      setSocieties(data.societies || []);
    } catch { toast.error('Failed to fetch societies'); }
    finally { setLoadingConfig(prev => ({ ...prev, societies: false })); }
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch('/api/config/clubs?active=false');
      const data = await res.json();
      setClubs(data.clubs || []);
    } catch { toast.error('Failed to fetch clubs'); }
    finally { setLoadingConfig(prev => ({ ...prev, clubs: false })); }
  };

  const fetchParentBlocks = async () => {
    try {
      const res = await fetch('/api/config/parent-blocks?active=false');
      const data = await res.json();
      setParentBlocks(data.parentBlocks || []);
    } catch { toast.error('Failed to fetch parent blocks'); }
    finally { setLoadingConfig(prev => ({ ...prev, blocks: false })); }
  };

  // ---- User Management Functions ----
  const clearUserForm = () => {
    setUserId(''); setName(''); setCollegeName(''); setDept(''); setMail(''); setPassword('');
    setUserType(''); setIsSuperAdmin(false); setIdNumber(''); setRole(''); setPhone('');
    setCurrSoc(''); setFetchEmail(''); setUserFetched(false); setUserErrors({});
  };

  const validateUserForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!mail.trim()) errors.mail = 'Email is required';
    if (!userType) errors.userType = 'User type is required';
    if (userTab === 0 && !password.trim()) errors.password = 'Password is required';
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFetchUser = async () => {
    if (!fetchEMail.trim()) { toast.error('Please enter an email'); return; }
    setUserLoading(true);
    try {
      const res = await fetch('/api/fetchUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetchUser', mail: fetchEMail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message === 'User not found') { toast.error('User not found'); return; }
        const user = data.message[0];
        setUserId(user._id); setDept(user.dept); setName(user.name); setMail(user.email);
        setUserType(user.userType); setIsSuperAdmin(user.isSuperAdmin); setIdNumber(user.id);
        setCollegeName(user.college); setRole(user.role); setPhone(user.phone);
        setUserFetched(true);
        toast.success('User fetched');
      } else { toast.error('Failed to fetch user'); }
    } catch { toast.error('Failed to fetch user'); }
    finally { setUserLoading(false); }
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) return;
    setUserLoading(true);
    try {
      const res = await fetch('/api/addUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, college: collegeName, dept: dept === 'IEEE' ? currSoc : userType === 'admin' ? '-' : dept,
          mail, password, userType: ['professionalsocieties', 'clubincharge'].includes(userType) ? 'HOD' : userType,
          isSuperAdmin,
        }),
      });
      if (res.ok) { toast.success('User added!'); clearUserForm(); }
      else { toast.error('Failed to add user'); }
    } catch { toast.error('Failed to add user'); }
    finally { setUserLoading(false); }
  };

  const handleUpdateUser = async () => {
    if (!validateUserForm()) return;
    setUserLoading(true);
    try {
      const res = await fetch('/api/editUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: userId, name, college: collegeName, dept: dept === 'IEEE' ? currSoc : userType === 'admin' ? '-' : dept,
          mail, userType: ['professionalsocieties', 'clubincharge'].includes(userType) ? 'HOD' : userType,
          isSuperAdmin, phone, role, id: idNumber,
        }),
      });
      if (res.ok) { toast.success('User updated!'); clearUserForm(); }
      else { toast.error('Failed to update user'); }
    } catch { toast.error('Failed to update user'); }
    finally { setUserLoading(false); }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Delete this user?')) return;
    setUserLoading(true);
    try {
      const res = await fetch('/api/fetchUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', mail: fetchEMail }),
      });
      if (res.ok) { toast.success('User deleted'); clearUserForm(); }
      else { toast.error('Delete failed'); }
    } catch { toast.error('Delete failed'); }
    finally { setUserLoading(false); }
  };

  const handleChangePassword = async () => {
    setUserLoading(true);
    try {
      const res = await fetch('/api/changePwd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin', _id: userId }),
      });
      if (res.ok) { const data = await res.json(); toast.success(data.message); }
      else { toast.error('Error changing password'); }
    } catch { toast.error('Error changing password'); }
    finally { setUserLoading(false); }
  };

  // ---- Config CRUD Functions ----
  const openAddDialog = (type) => {
    setDialogType(type);
    setEditingItem(null);
    setFormData({ isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (type, item) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setDialogType(''); setEditingItem(null); setFormData({}); };

  const handleConfigSave = async () => {
    setSubmitting(true);
    const endpoints = { college: '/api/config/colleges', department: '/api/config/departments', society: '/api/config/societies', club: '/api/config/clubs', parentBlock: '/api/config/parent-blocks' };
    const endpoint = editingItem ? `${endpoints[dialogType]}/${editingItem._id}` : endpoints[dialogType];
    try {
      const res = await fetch(endpoint, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { toast.success('Saved!'); closeDialog(); fetchAllConfig(); }
      else { const err = await res.json(); toast.error(err.message || 'Failed'); }
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const handleConfigDelete = async (type, item) => {
    if (!confirm(`Delete "${item.name || item.code}"?`)) return;
    const endpoints = { college: '/api/config/colleges', department: '/api/config/departments', society: '/api/config/societies', club: '/api/config/clubs', parentBlock: '/api/config/parent-blocks' };
    try {
      const res = await fetch(`${endpoints[type]}/${item._id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted!'); fetchAllConfig(); }
      else { toast.error('Delete failed'); }
    } catch { toast.error('Delete failed'); }
  };

  // ---- Auth Check ----
  if (status === 'loading') return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
  if (session?.user?.isSuperAdmin === 0) return <Alert severity='error' sx={{ m: 4 }}>Not Authorized</Alert>;

  // ---- Render Dialog Content ----
  const renderDialogContent = () => {
    const fields = {
      college: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }],
      department: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'college', label: 'College', type: 'select', options: ['SIT', 'SEC', 'common'] }, { key: 'eventIdTemplate', label: 'Event ID Template', placeholder: 'e.g., CLGYEARMMDCSYY' }],
      society: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type', type: 'select', options: ['professional', 'ieee'] }, { key: 'eventIdTemplate', label: 'Event ID Template', placeholder: 'e.g., CLGYEARMMSTEYY' }],
      club: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'eventIdTemplate', label: 'Event ID Template', placeholder: 'e.g., CLGYEARMMCTCYY' }],
      parentBlock: [{ key: 'name', label: 'Name' }],
    };
    return (
      <Stack spacing={2} sx={{ mt: 1, minWidth: 350 }}>
        {(fields[dialogType] || []).map((f) => f.type === 'select' ? (
          <FormControl key={f.key} fullWidth>
            <InputLabel>{f.label}</InputLabel>
            <Select value={formData[f.key] || ''} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} label={f.label}>
              {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        ) : (
          <TextField key={f.key} label={f.label} value={formData[f.key] || ''} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} fullWidth placeholder={f.placeholder} helperText={f.key === 'eventIdTemplate' ? 'CLG=College, YEAR=Year, MM=Month, D=Dept, YY=Sequence' : ''} />
        ))}
        <FormControlLabel control={<Switch checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label='Active' />
      </Stack>
    );
  };

  return (
    <Box sx={{ bgcolor: colors.light.secondaryHex, p: { xs: 2, md: 4 }, borderRadius: 3, minHeight: '100vh' }}>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 3, color: colors.light.primaryHex }}>Admin Panel</Typography>

      {/* Main Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)} variant='fullWidth'>
          <Tab icon={<Users size={20} />} label='User Management' iconPosition='start' />
          <Tab icon={<Gear size={20} />} label='Configuration' iconPosition='start' />
        </Tabs>
      </Paper>

      {/* =============== USER MANAGEMENT TAB =============== */}
      <TabPanel value={mainTab} index={0}>
        <Paper sx={{ borderRadius: 2, mb: 2 }}>
          <Tabs value={userTab} onChange={(e, v) => { setUserTab(v); clearUserForm(); }} variant='fullWidth'>
            <Tab label='Add User' />
            <Tab label='Edit User' />
          </Tabs>
        </Paper>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Add User */}
            {userTab === 0 && (
              <Stack spacing={2}>
                <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} error={!!userErrors.name} helperText={userErrors.name} required fullWidth />
                <FormControl fullWidth required error={!!userErrors.userType}>
                  <InputLabel>User Type</InputLabel>
                  <Select value={userType} onChange={(e) => setUserType(e.target.value)} label='User Type'>
                    <MenuItem value='admin'>Admin</MenuItem>
                    <MenuItem value='HOD'>HOD</MenuItem>
                    <MenuItem value='professionalsocieties'>Professional Society Head</MenuItem>
                    <MenuItem value='clubincharge'>Club Incharge</MenuItem>
                    <MenuItem value='staff'>Staff</MenuItem>
                  </Select>
                </FormControl>
                {['staff', 'HOD', 'admin'].includes(userType) && (
                  <FormControl fullWidth>
                    <InputLabel>College</InputLabel>
                    <Select value={collegeName} onChange={(e) => setCollegeName(e.target.value)} label='College'>
                      {colleges.map((c) => <MenuItem key={c._id} value={c.code}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {userType === 'professionalsocieties' && (
                  <FormControl fullWidth>
                    <InputLabel>Society</InputLabel>
                    <Select value={dept} onChange={(e) => setDept(e.target.value)} label='Society'>
                      {societies.filter(s => s.type === 'professional').map((s) => <MenuItem key={s._id} value={s.code}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {userType === 'professionalsocieties' && dept === 'IEEE' && (
                  <FormControl fullWidth>
                    <InputLabel>IEEE Society</InputLabel>
                    <Select value={currSoc} onChange={(e) => setCurrSoc(e.target.value)} label='IEEE Society'>
                      {societies.filter(s => s.type === 'ieee').map((s) => <MenuItem key={s._id} value={s.code}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {userType === 'clubincharge' && (
                  <FormControl fullWidth>
                    <InputLabel>Club</InputLabel>
                    <Select value={dept} onChange={(e) => setDept(e.target.value)} label='Club'>
                      {clubs.map((c) => <MenuItem key={c._id} value={c.code}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {['HOD', 'staff'].includes(userType) && collegeName && (
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select value={dept} onChange={(e) => setDept(e.target.value)} label='Department'>
                      {departments.filter(d => d.college === collegeName).map((d) => <MenuItem key={d._id} value={d.code}>{d.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                <TextField label='Email' type='email' value={mail} onChange={(e) => setMail(e.target.value)} error={!!userErrors.mail} helperText={userErrors.mail} required fullWidth />
                <TextField label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} error={!!userErrors.password} helperText={userErrors.password} required fullWidth />
                <FormControlLabel control={<Checkbox checked={isSuperAdmin} onChange={(e) => setIsSuperAdmin(e.target.checked)} />} label='Super Admin' />
                <Stack direction='row' spacing={2}>
                  <Button variant='contained' startIcon={userLoading ? <CircularProgress size={18} /> : <FloppyDisk size={18} />} onClick={handleAddUser} disabled={userLoading}
                    sx={{ bgcolor: colors.light.primaryHex }}>Add User</Button>
                  <Button variant='outlined' startIcon={<ArrowClockwise size={18} />} onClick={clearUserForm}>Clear</Button>
                </Stack>
              </Stack>
            )}

            {/* Edit User */}
            {userTab === 1 && (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label='Email to Find' value={fetchEMail} onChange={(e) => setFetchEmail(e.target.value)} fullWidth />
                  <Button variant='contained' startIcon={<MagnifyingGlass size={18} />} onClick={handleFetchUser} disabled={userLoading}
                    sx={{ bgcolor: colors.light.primaryHex, minWidth: 120 }}>Find</Button>
                </Box>
                {userFetched && (
                  <>
                    <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                    <TextField label='Email' value={mail} onChange={(e) => setMail(e.target.value)} fullWidth />
                    <FormControl fullWidth>
                      <InputLabel>User Type</InputLabel>
                      <Select value={userType} onChange={(e) => setUserType(e.target.value)} label='User Type'>
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='HOD'>HOD</MenuItem>
                        <MenuItem value='staff'>Staff</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel control={<Checkbox checked={isSuperAdmin} onChange={(e) => setIsSuperAdmin(e.target.checked)} />} label='Super Admin' />
                    <Stack direction='row' spacing={2} flexWrap='wrap'>
                      <Button variant='contained' startIcon={<FloppyDisk size={18} />} onClick={handleUpdateUser} disabled={userLoading} sx={{ bgcolor: colors.light.primaryHex }}>Update</Button>
                      <Button variant='outlined' startIcon={<Key size={18} />} onClick={handleChangePassword} disabled={userLoading}>Reset Password</Button>
                      <Button variant='outlined' color='error' startIcon={<Trash size={18} />} onClick={handleDeleteUser} disabled={userLoading}>Delete</Button>
                    </Stack>
                  </>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* =============== CONFIGURATION TAB =============== */}
      <TabPanel value={mainTab} index={1}>
        <Paper sx={{ borderRadius: 2, mb: 2 }}>
          <Tabs value={configTab} onChange={(e, v) => setConfigTab(v)} variant='scrollable' scrollButtons='auto'>
            <Tab icon={<Buildings size={18} />} label='Colleges' iconPosition='start' />
            <Tab icon={<UsersThree size={18} />} label='Departments' iconPosition='start' />
            <Tab icon={<Users size={18} />} label='Societies' iconPosition='start' />
            <Tab icon={<Users size={18} />} label='Clubs' iconPosition='start' />
            <Tab icon={<MapPin size={18} />} label='Parent Blocks' iconPosition='start' />
          </Tabs>
        </Paper>

        <TabPanel value={configTab} index={0}>
          <ConfigTable title='Colleges' data={colleges} entityName='College' loading={loadingConfig.colleges}
            columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'isActive', label: 'Status', render: (v) => <ActiveChip isActive={v} /> }]}
            onAdd={() => openAddDialog('college')} onEdit={(item) => openEditDialog('college', item)} onDelete={(item) => handleConfigDelete('college', item)} />
        </TabPanel>
        <TabPanel value={configTab} index={1}>
          <ConfigTable title='Departments' data={departments} entityName='Department' loading={loadingConfig.departments}
            columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'college', label: 'College', render: (v) => <Chip size='small' label={v} /> }, { key: 'eventIdTemplate', label: 'Template', render: (v) => v ? <Chip size='small' label={v} variant='outlined' /> : '-' }, { key: 'isActive', label: 'Status', render: (v) => <ActiveChip isActive={v} /> }]}
            onAdd={() => openAddDialog('department')} onEdit={(item) => openEditDialog('department', item)} onDelete={(item) => handleConfigDelete('department', item)} />
        </TabPanel>
        <TabPanel value={configTab} index={2}>
          <ConfigTable title='Societies' data={societies} entityName='Society' loading={loadingConfig.societies}
            columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type', render: (v) => <Chip size='small' label={v} color={v === 'ieee' ? 'primary' : 'default'} /> }, { key: 'eventIdTemplate', label: 'Template', render: (v) => v ? <Chip size='small' label={v} variant='outlined' /> : '-' }, { key: 'isActive', label: 'Status', render: (v) => <ActiveChip isActive={v} /> }]}
            onAdd={() => openAddDialog('society')} onEdit={(item) => openEditDialog('society', item)} onDelete={(item) => handleConfigDelete('society', item)} />
        </TabPanel>
        <TabPanel value={configTab} index={3}>
          <ConfigTable title='Clubs' data={clubs} entityName='Club' loading={loadingConfig.clubs}
            columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'eventIdTemplate', label: 'Template', render: (v) => v ? <Chip size='small' label={v} variant='outlined' /> : '-' }, { key: 'isActive', label: 'Status', render: (v) => <ActiveChip isActive={v} /> }]}
            onAdd={() => openAddDialog('club')} onEdit={(item) => openEditDialog('club', item)} onDelete={(item) => handleConfigDelete('club', item)} />
        </TabPanel>
        <TabPanel value={configTab} index={4}>
          <ConfigTable title='Parent Blocks' data={parentBlocks} entityName='Parent Block' loading={loadingConfig.blocks}
            columns={[{ key: 'name', label: 'Name' }, { key: 'isActive', label: 'Status', render: (v) => <ActiveChip isActive={v} /> }]}
            onAdd={() => openAddDialog('parentBlock')} onEdit={(item) => openEditDialog('parentBlock', item)} onDelete={(item) => handleConfigDelete('parentBlock', item)} />
        </TabPanel>
      </TabPanel>

      {/* =============== ADD/EDIT DIALOG =============== */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editingItem ? 'Edit' : 'Add'} {dialogType.replace(/([A-Z])/g, ' $1').trim()}</DialogTitle>
        <DialogContent>{renderDialogContent()}</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant='contained' onClick={handleConfigSave} disabled={submitting} sx={{ bgcolor: colors.light.primaryHex }}>
            {submitting ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
