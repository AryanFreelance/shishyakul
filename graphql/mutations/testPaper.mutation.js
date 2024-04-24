import { gql } from "@apollo/client";

export const CREATE_TEST = gql`
  mutation CREATE_TEST(
    $title: String!
    $subject: String!
    $date: String!
    $totalMarks: Int!
    $url: String!
  ) {
    createTest(
      title: $title
      subject: $subject
      date: $date
      totalMarks: $totalMarks
      url: $url
    ) {
      id
      createdAt
      date
      sharedWith
      subject
      title
      totalMarks
      url
    }
  }
`;

export const UPDATE_TESTPAPER = gql`
  mutation UPDATE_TESTPAPER(
    $id: ID!
    $title: String
    $subject: String
    $date: String
    $totalMarks: Int
    $sharedWith: [String]
  ) {
    updateTest(
      id: $id
      title: $title
      subject: $subject
      date: $date
      totalMarks: $totalMarks
      sharedWith: $sharedWith
    ) {
      id
      date
      createdAt
      title
    }
  }
`;

export const DELETE_TESTPAPER = gql`
  mutation DELETE_TESTPAPER($id: ID!) {
    deleteTest(id: $id) {
      id
      createdAt
      date
      title
    }
  }
`;
