# Role-Based Dashboards

LifeTrack now supports different dashboard experiences based on user roles. The system automatically renders the appropriate dashboard based on the user's role stored in their profile.

## User Roles

### 1. Patient Dashboard (`PatientDashboard.js`)
**Features:**
- Health score tracking
- Medication management and reminders
- Vital signs monitoring
- Appointment scheduling
- Care plan viewing
- Daily health check-ins
- Symptom tracking

**Key Components:**
- Health overview with vital signs
- Today's medication schedule
- Quick actions for health management
- Daily reminders and alerts
- Recent activity feed

### 2. Caregiver Dashboard (`CaregiverDashboard.js`)
**Features:**
- Patient management
- Care plan administration
- Visit scheduling
- Patient alerts and notifications
- Vital signs recording
- Report generation

**Key Components:**
- Today's patient list
- Active patients overview
- Care plans management
- Quick actions for patient care
- Recent alerts and notifications

### 3. Admin Dashboard
Currently defaults to the Caregiver Dashboard for administrators, but can be extended with additional administrative features.

## Implementation Details

### File Structure
```
frontend/src/pages/
├── Dashboard.js (Main router component)
├── PatientDashboard.js (Patient-specific dashboard)
└── CaregiverDashboard.js (Caregiver-specific dashboard)
```

### Role-Based Routing
The main `Dashboard.js` component acts as a router that checks the user's role and renders the appropriate dashboard:

```javascript
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'caregiver') {
    return <CaregiverDashboard />;
  } else if (user?.role === 'patient') {
    return <PatientDashboard />;
  } else {
    return <CaregiverDashboard />; // Default for admin
  }
};
```

### User Registration
During registration, users can select their role:
- Patient
- Caregiver
- Healthcare Administrator

The role is stored in the user's profile and used to determine which dashboard to display.

## Styling

Both dashboards use the existing design system with:
- Tailwind CSS for styling
- Custom color palette (primary, secondary, healthcare, warm)
- Consistent card layouts and components
- Responsive design for all screen sizes

## Future Enhancements

1. **Admin Dashboard**: Create a dedicated admin dashboard with system management features
2. **Role Permissions**: Implement granular permissions for different actions
3. **Dashboard Customization**: Allow users to customize their dashboard layout
4. **Real-time Updates**: Add real-time notifications and updates
5. **Analytics**: Include role-specific analytics and reporting

## Testing

To test different dashboards:
1. Register a new account with different roles
2. Login with each account type
3. Verify that the appropriate dashboard is displayed
4. Test the functionality specific to each role
