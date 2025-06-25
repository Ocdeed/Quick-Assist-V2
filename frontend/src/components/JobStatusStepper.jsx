/* eslint-disable no-unused-vars */
// src/components/JobStatusStepper.jsx
import { Stepper, Step, StepLabel, StepIcon, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const steps = ['Pending', 'Accepted', 'In Progress', 'Completed'];
const stepIndex = {
    'PENDING': 0,
    'ACCEPTED': 1,
    'IN_PROGRESS': 2,
    'COMPLETED': 3,
    'CANCELLED': 4 // Special case
};

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.dark,
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {/* This just shows the number of the step */}
      {String(icon)}
    </ColorlibStepIconRoot>
  );
}

const JobStatusStepper = ({ status }) => {
    const activeStep = stepIndex[status];

    if (status === 'CANCELLED') {
        // Handle cancelled case separately if desired
        return null; 
    }

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default JobStatusStepper;