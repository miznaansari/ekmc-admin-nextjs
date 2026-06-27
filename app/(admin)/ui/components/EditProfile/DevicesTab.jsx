import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

// DevicesTab Component
const DevicesTab = () => {
  // Hardcoded device data for multiple users in each category
  const devicesData = [
    {
      category: 'Manager',
      users: [
        {
          name: 'John Doe',
          devices: [
            {
              name: 'Device A',
              timestamp: '10/21/2024, 2:30:11 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7986',
              isCurrent: true,
              access: true,
            },
            {
              name: 'Device B',
              timestamp: '10/20/2024, 1:20:15 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7987',
              isCurrent: false,
              access: false,
            },
          ],
        },
        {
          name: 'Alice Brown',
          devices: [
            {
              name: 'Device C',
              timestamp: '10/21/2024, 3:15:00 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7988',
              isCurrent: true,
              access: true,
            },
            {
              name: 'Device D',
              timestamp: '10/19/2024, 2:45:00 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7989',
              isCurrent: false,
              access: false,
            },
          ],
        },
      ],
    },
    {
      category: 'Caption',
      users: [
        {
          name: 'Jane Smith',
          devices: [
            {
              name: 'Device E',
              timestamp: '10/21/2024, 2:45:05 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7988',
              isCurrent: true,
              access: true,
            },
            {
              name: 'Device F',
              timestamp: '10/19/2024, 3:10:11 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7989',
              isCurrent: false,
              access: false,
            },
          ],
        },
        {
          name: 'Tom White',
          devices: [
            {
              name: 'Device G',
              timestamp: '10/21/2024, 4:00:00 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7990',
              isCurrent: false,
              access: false,
            },
          ],
        },
      ],
    },
    {
      category: 'Kitchen',
      users: [
        {
          name: 'Chef Mike',
          devices: [
            {
              name: 'Device H',
              timestamp: '10/21/2024, 4:30:00 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7990',
              isCurrent: true,
              access: true,
            },
            {
              name: 'Device I',
              timestamp: '10/18/2024, 5:00:22 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7991',
              isCurrent: false,
              access: false,
            },
          ],
        },
        {
          name: 'Chef Lucy',
          devices: [
            {
              name: 'Device J',
              timestamp: '10/21/2024, 6:00:00 PM',
              ip: '2409:40d4:4046:b69f:cb7:8331:ba89:7992',
              isCurrent: false,
              access: false,
            },
          ],
        },
      ],
    },
  ];

  // State to handle expanded user lists
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  // Handle expand/collapse click for categories
  const handleCategoryExpandClick = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
    setExpandedUser(null); // Reset expanded user when changing category
  };

  // Handle expand/collapse click for users
  const handleUserExpandClick = (index) => {
    setExpandedUser(expandedUser === index ? null : index);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Devices
      </Typography>
      {devicesData.map((category, catIndex) => (
        <Box key={catIndex} sx={{ mb: 3 }}>
          {/* Main Paper for Category */}
          <Paper
            sx={{
              p: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            elevation={2}
            onClick={() => handleCategoryExpandClick(catIndex)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {category.category}
            </Typography>
            <ExpandMoreIcon />
          </Paper>

          {/* Collapsible list of users within the category */}
          <Collapse in={expandedCategory === catIndex} timeout="auto" unmountOnExit>
            {category.users.map((user, userIndex) => (
              <Box key={userIndex} sx={{ mb: 2 }}>
                <Paper
                  sx={{
                    p: 2,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: 'lightgray',
                  }}
                  elevation={1}
                  onClick={() => handleUserExpandClick(userIndex)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                  <ExpandMoreIcon />
                </Paper>

                {/* Collapsible list of devices for the user */}
                <Collapse in={expandedUser === userIndex} timeout="auto" unmountOnExit>
                  <List>
                    {user.devices
                      .sort((a, b) => b.isCurrent - a.isCurrent) // Sort to show current device on top
                      .map((device, devIndex) => (
                        <ListItem
                          key={devIndex}
                          sx={{
                            backgroundColor: device.isCurrent ? 'lightgreen' : 'white',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemText
                            primary={`${device.name} - ${device.ip}`}
                            secondary={`${device.timestamp} ${
                              device.isCurrent ? '(Current Session)' : ''
                            }`}
                          />
                          <Button
                            variant="outlined"
                            color={device.access ? 'success' : 'secondary'}
                            sx={{ mr: 2 }}
                          >
                            {device.access ? 'Access Granted' : 'No Access'}
                          </Button>
                          <Button variant="outlined" color="error" startIcon={<CloseIcon />}>
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default DevicesTab;
