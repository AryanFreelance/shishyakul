import { gql } from "@apollo/client";

// Get all Students for marking attendance
export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      userId
      email
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

// Get the Student's attendance of a particular academic year, grade, and timestamp
export const GET_AG_ATTENDANCE = gql`
  query Attendance($ay: String, $grade: String, $timestamp: String) {
    attendance(ay: $ay, grade: $grade, timestamp: $timestamp) {
      timestamp
      present
      absent
    }
  }
`;
