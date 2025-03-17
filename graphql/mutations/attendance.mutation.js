const { gql } = require("@apollo/client");

// Create Attendance
// mutation CreateAttendance(
//   $ay: String!
//   $grade: String!
//   $timestamp: ID!
//   $date: String!
//   $present: [ID]!
//   $absent: [ID]!
// ) {
//   createAttendance(
//     ay: $ay
//     grade: $grade
//     timestamp: $timestamp
//     date: $date
//     present: $present
//     absent: $absent
//   )
// }
export const ATTENDANCE_HANDLER = gql`
  mutation AttendanceHandler(
    $ay: String!
    $grade: String!
    $timestamp: ID!
    $date: String!
    $present: [ID]!
    $absent: [ID]!
    $facultyId: ID
  ) {
    attendanceHandler(
      ay: $ay
      grade: $grade
      timestamp: $timestamp
      date: $date
      present: $present
      absent: $absent
      facultyId: $facultyId
    )
  }
`;

// Update Attendance
export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($present: [ID]!, $absent: [ID]!, $timestamp: ID!, $facultyId: ID) {
    updateAttendance(timestamp: $timestamp, present: $present, absent: $absent, facultyId: $facultyId)
  }
`;
