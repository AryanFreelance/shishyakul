const { gql } = require("@apollo/client");

// Create Attendance
export const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance($timestamp: ID!, $present: [ID]!, $absent: [ID]!) {
    createAttendance(present: $present, absent: $absent, timestamp: $timestamp)
  }
`;

// Update Attendance
export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($present: [ID]!, $absent: [ID]!, $timestamp: ID!) {
    updateAttendance(timestamp: $timestamp, present: $present, absent: $absent)
  }
`;
