import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}22`,
          borderRadius: '50%',
          p: 1,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { sx: { color: color, fontSize: 32 } })}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function SubscriptionManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const plans = [
    {
      id: 1,
      name: 'Basic Plan',
      price: 500,
      duration: 30,
      videoLimit: 50,
      activeSubscribers: 234,
      description: 'Access to basic video lessons',
      features: ['50 video lessons', '30 days access', 'Basic subjects only']
    },
    {
      id: 2,
      name: 'Standard Plan',
      price: 1000,
      duration: 30,
      videoLimit: 100,
      activeSubscribers: 567,
      description: 'Full access to all standard features',
      features: ['100 video lessons', '30 days access', 'All subjects']
    },
    {
      id: 3,
      name: 'Premium Plan',
      price: 2000,
      duration: 30,
      videoLimit: 0,
      activeSubscribers: 123,
      description: 'Unlimited access to all features',
      features: ['Unlimited videos', '30 days access', 'All subjects + Premium content']
    },
  ];

  const vouchers = [
    {
      id: 1,
      code: 'PREP2025',
      discount: 20,
      type: 'Percentage',
      validUntil: '2025-12-31',
      usageLimit: 100,
      usedCount: 45,
      status: 'Active'
    },
    {
      id: 2,
      code: 'WELCOME500',
      discount: 500,
      type: 'Fixed Amount',
      validUntil: '2025-06-30',
      usageLimit: 50,
      usedCount: 32,
      status: 'Active'
    },
  ];

  const handleAddPlan = () => {
    setEditingPlan(null);
    setOpenDialog(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setOpenDialog(true);
  };

  const handleDeletePlan = (plan) => {
    // TODO: Implement delete plan functionality
    console.log('Delete plan:', plan);
  };

  const handleSavePlan = (formData) => {
    // TODO: Implement save plan functionality
    console.log('Save plan:', formData);
    setOpenDialog(false);
  };

  const handleAddVoucher = () => {
    setOpenVoucherDialog(true);
  };

  const handleSaveVoucher = (formData) => {
    // TODO: Implement save voucher functionality
    console.log('Save voucher:', formData);
    setOpenVoucherDialog(false);
  };

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Subscribers"
            value="924"
            icon={<SupervisorAccountIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="₦1.2M"
            icon={<LocalOfferIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Vouchers"
            value="12"
            icon={<TimerIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Videos Accessed"
            value="15.6K"
            icon={<VideocamIcon />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Subscription Plans" />
          <Tab label="Voucher Codes" />
          <Tab label="Active Subscriptions" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPlan}
              >
                Add Plan
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price (₦)</TableCell>
                    <TableCell>Duration (Days)</TableCell>
                    <TableCell>Video Limit</TableCell>
                    <TableCell>Active Subscribers</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>{plan.price}</TableCell>
                      <TableCell>{plan.duration}</TableCell>
                      <TableCell>{plan.videoLimit || 'Unlimited'}</TableCell>
                      <TableCell>{plan.activeSubscribers}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePlan(plan)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddVoucher}
              >
                Add Voucher
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Valid Until</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>{voucher.code}</TableCell>
                      <TableCell>
                        {voucher.type === 'Percentage' 
                          ? `${voucher.discount}%`
                          : `₦${voucher.discount}`
                        }
                      </TableCell>
                      <TableCell>{voucher.type}</TableCell>
                      <TableCell>{voucher.validUntil}</TableCell>
                      <TableCell>{voucher.usedCount}/{voucher.usageLimit}</TableCell>
                      <TableCell>{voucher.status}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* TODO: Add active subscriptions data */}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </Paper>

      {/* Plan Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edit Subscription Plan' : 'New Subscription Plan'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              variant="outlined"
              defaultValue={editingPlan?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price (₦)"
              type="number"
              variant="outlined"
              defaultValue={editingPlan?.price}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Duration (Days)"
              type="number"
              variant="outlined"
              defaultValue={editingPlan?.duration}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Video Limit (0 for unlimited)"
              type="number"
              variant="outlined"
              defaultValue={editingPlan?.videoLimit}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              defaultValue={editingPlan?.description}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePlan}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Voucher Dialog */}
      <Dialog
        open={openVoucherDialog}
        onClose={() => setOpenVoucherDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Voucher Code</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Voucher Code"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Discount Value"
              type="number"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Discount Type</InputLabel>
              <Select label="Discount Type" defaultValue="percentage">
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed Amount</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Valid Until"
              type="date"
              variant="outlined"
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Usage Limit"
              type="number"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVoucherDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveVoucher}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
