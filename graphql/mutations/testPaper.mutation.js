import { gql } from "@apollo/client";

// Create a Test Paper
export const CREATE_TEST = gql`
  mutation CreateTest(
    $id: ID!
    $title: String!
    $date: String!
    $totalMarks: Int!
    $url: String!
    $subject: String!
  ) {
    createTest(
      id: $id
      title: $title
      date: $date
      totalMarks: $totalMarks
      url: $url
      subject: $subject
    )
  }
`;

// Update Draft Test Papers
export const UPDATE_TESTPAPER = gql`
  mutation UpdateDraftTest(
    $id: ID!
    $title: String
    $subject: String
    $date: String
    $totalMarks: Int
  ) {
    updateDraftTest(
      id: $id
      title: $title
      subject: $subject
      date: $date
      totalMarks: $totalMarks
    )
  }
`;

// Publish a Test Paper
export const PUBLISH_TESTPAPER = gql`
  mutation PublishTestPaper($id: ID!) {
    publishTestPaper(id: $id)
  }
`;

// Update Shared With for Published Tests
export const UPDATE_SHARED_WITH = gql`
  mutation UpdateSharedTest($id: ID!, $sharedWith: [String]) {
    updateSharedTest(id: $id, sharedWith: $sharedWith)
  }
`;

// Delete a Test Paper
export const DELETE_TESTPAPER = gql`
  mutation DeleteTest($id: ID!, $published: Boolean!) {
    deleteTest(id: $id, published: $published)
  }
`;

// Save Test Marks
export const SAVE_TEST_MARKS = gql`
  mutation AddMarks($testId: ID!, $data: [MarksInput]) {
    addMarks(testId: $testId, data: $data)
  }
`;
