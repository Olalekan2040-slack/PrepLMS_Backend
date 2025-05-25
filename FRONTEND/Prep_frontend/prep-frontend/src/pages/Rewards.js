import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import NetworkCellIcon from '@mui/icons-material/NetworkCell';
import DataUsageIcon from '@mui/icons-material/DataUsage';

// Sample rewards data - replace with API integration
const rewardsData = {
  points: 1250,
  streak: 7,
  weeklyPoints: 450,
  monthlyPoints: 1800,
  availableRewards: [
    {
      id: 1,
      title: '500MB Data',
      description: 'Get 500MB of mobile data',
      points: 500,
      icon: <DataUsageIcon sx={{ fontSize: 40 }} />,
      network: 'MTN'
    },
    {
      id: 2,
      title: '1GB Data',
      description: 'Get 1GB of mobile data',
      points: 1000,
      icon: <NetworkCellIcon sx={{ fontSize: 40 }} />,
      network: 'Airtel'
    }
  ],
  pointHistory: [
    { date: '2025-05-16', activity: 'Completed Physics Video', points: 50 },
    { date: '2025-05-16', activity: 'Daily Streak Bonus', points: 100 },
    { date: '2025-05-15', activity: 'Completed Chemistry Video', points: 50 },
    { date: '2025-05-14', activity: 'Weekly Challenge', points: 200 }
  ],
  streakData: {
    currentStreak: 7,
    longestStreak: 14,
    weekProgress: 5,
    nextMilestone: 10,
    todayCompleted: true
  }
};

function ProgressCard({ title, value, max, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28, mr: 1 } })}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ color, mb: 1 }}>
          {value}
        </Typography>
        {max && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Progress</Typography>
              <Typography variant="body2" color="text.secondary">{value}/{max}</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(value / max) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RewardCard({ reward, onRedeem, disabled }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmRedeem = () => {
    setConfirmOpen(false);
    onRedeem(reward);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {reward.icon}
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6">{reward.title}</Typography>
              <Chip 
                label={reward.network}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {reward.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              icon={<EmojiEventsIcon />}
              label={`${reward.points} points`}
              color="warning"
            />
            <Button
              variant="contained"
              disabled={disabled}
              onClick={() => setConfirmOpen(true)}
            >
              Redeem
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Redemption</DialogTitle>
        <DialogContent>
          Are you sure you want to redeem {reward.title} for {reward.points} points?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRedeem} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function DailyStreakView({ data }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WhatshotIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
        <Box>
          <Typography variant="h6">
            {data.currentStreak} Day Streak
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep learning daily to maintain your streak
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={1} sx={{ mb: 3 }}>
        {days.map((day, index) => (
          <Grid item xs key={day}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                bgcolor: index < data.weekProgress ? 'success.light' : 'background.default',
                color: index < data.weekProgress ? 'success.contrastText' : 'text.primary'
              }}
            >
              <Typography variant="body2">{day}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Next Milestone</Typography>
          <Typography variant="body2">{data.currentStreak}/{data.nextMilestone} days</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(data.currentStreak / data.nextMilestone) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
        <Typography variant="body2">
          Longest Streak: {data.longestStreak} days
        </Typography>
        <Typography variant="body2">
          {data.todayCompleted ? '✓ Today Complete' : '○ Complete a video today'}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Rewards() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRedeem = (reward) => {
    // TODO: Implement redemption logic with API
    console.log('Redeeming reward:', reward);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        Rewards
      </Typography>

      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        sx={{ mb: 4 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Overview" />
        <Tab label="Streak Tracker" />
        <Tab label="Redeem Points" />
        <Tab label="Points History" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <ProgressCard
                  title="Total Points"
                  value={rewardsData.points}
                  icon={<EmojiEventsIcon />}
                  color="warning.main"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProgressCard
                  title="Current Streak"
                  value={rewardsData.streak}
                  icon={<WhatshotIcon />}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProgressCard
                  title="Weekly Points"
                  value={rewardsData.weeklyPoints}
                  max={1000}
                  icon={<TimelineIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProgressCard
                  title="Monthly Points"
                  value={rewardsData.monthlyPoints}
                  max={5000}
                  icon={<TimelineIcon />}
                  color="info.main"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                How to Earn Points
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" sx={{ mb: 1 }}>
                  Complete a video lesson (50 points)
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Daily learning streak (100 points/day)
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Weekly challenge completion (200 points)
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Subject mastery (500 points)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <DailyStreakView data={rewardsData.streakData} />
      )}

      {tab === 2 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEventsIcon color="warning" />
            <Typography>
              You have <strong>{rewardsData.points} points</strong> available
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {rewardsData.availableRewards.map(reward => (
              <Grid item xs={12} sm={6} md={4} key={reward.id}>
                <RewardCard
                  reward={reward}
                  onRedeem={handleRedeem}
                  disabled={rewardsData.points < reward.points}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Points History
          </Typography>
          {rewardsData.pointHistory.map((item, index) => (
            <React.Fragment key={index}>
              <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1">
                    {item.activity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  icon={<EmojiEventsIcon />}
                  label={`+${item.points} points`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
              {index < rewardsData.pointHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Paper>
      )}
    </Container>
  );
}
