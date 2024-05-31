import { gql } from "@apollo/client";

// Get all Students for marking attendance
export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      userId
      firstname
      lastname
    }
  }
`;

// Get Attendance for a particular date
export const GET_ATTENDANCE = gql`
  query Attendance($timestamp: String!) {
    attendance(timestamp: $timestamp) {
      timestamp
      absent
      present
    }
  }
`;
