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
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import PeopleIcon from '@mui/icons-material/People';

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

export default function RewardsManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [openRewardDialog, setOpenRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  const rewards = [
    {
      id: 1,
      name: '500MB Data Bundle',
      pointsCost: 100,
      provider: 'MTN',
      description: '500MB Mobile Data Valid for 30 Days',
      totalRedeemed: 234,
      status: 'Active'
    },
    {
      id: 2,
      name: '1GB Data Bundle',
      pointsCost: 200,
      provider: 'Airtel',
      description: '1GB Mobile Data Valid for 30 Days',
      totalRedeemed: 156,
      status: 'Active'
    },
    {
      id: 3,
      name: '2GB Data Bundle',
      pointsCost: 350,
      provider: 'Glo',
      description: '2GB Mobile Data Valid for 30 Days',
      totalRedeemed: 89,
      status: 'Inactive'
    }
  ];

  const topEarners = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      totalPoints: 1500,
      currentStreak: 15,
      joinDate: '2025-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      totalPoints: 1200,
      currentStreak: 12,
      joinDate: '2025-02-01'
    }
  ];

  const recentRedemptions = [
    {
      id: 1,
      user: 'John Doe',
      reward: '500MB Data Bundle',
      pointsSpent: 100,
      status: 'Success',
      date: '2025-05-15'
    },
    {
      id: 2,
      user: 'Jane Smith',
      reward: '1GB Data Bundle',
      pointsSpent: 200,
      status: 'Pending',
      date: '2025-05-16'
    }
  ];

  const handleAddReward = () => {
    setEditingReward(null);
    setOpenRewardDialog(true);
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setOpenRewardDialog(true);
  };

  const handleSaveReward = (formData) => {
    // TODO: Implement save reward functionality
    console.log('Save reward:', formData);
    setOpenRewardDialog(false);
  };

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Points Earned"
            value="156.5K"
            icon={<EmojiEventsIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value="924"
            icon={<PeopleIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Longest Streak"
            value="45 Days"
            icon={<WhatshotIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Points Redeemed"
            value="89.2K"
            icon={<DataUsageIcon />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Available Rewards" />
          <Tab label="Recent Redemptions" />
          <Tab label="Top Earners" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddReward}
              >
                Add Reward
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Points Cost</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Total Redeemed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>{reward.name}</TableCell>
                      <TableCell>{reward.pointsCost}</TableCell>
                      <TableCell>{reward.provider}</TableCell>
                      <TableCell>{reward.totalRedeemed}</TableCell>
                      <TableCell>
                        <Chip 
                          label={reward.status}
                          color={reward.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditReward(reward)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Reward</TableCell>
                    <TableCell>Points Spent</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentRedemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell>{redemption.user}</TableCell>
                      <TableCell>{redemption.reward}</TableCell>
                      <TableCell>{redemption.pointsSpent}</TableCell>
                      <TableCell>{redemption.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={redemption.status}
                          color={redemption.status === 'Success' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon />
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Total Points</TableCell>
                    <TableCell>Current Streak</TableCell>
                    <TableCell>Join Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topEarners.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.totalPoints}</TableCell>
                      <TableCell>{user.currentStreak} days</TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </Paper>

      {/* Reward Dialog */}
      <Dialog
        open={openRewardDialog}
        onClose={() => setOpenRewardDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReward ? 'Edit Reward' : 'New Reward'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Reward Name"
              variant="outlined"
              defaultValue={editingReward?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Points Cost"
              type="number"
              variant="outlined"
              defaultValue={editingReward?.pointsCost}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Provider"
              variant="outlined"
              defaultValue={editingReward?.provider}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              defaultValue={editingReward?.description}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRewardDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveReward}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
