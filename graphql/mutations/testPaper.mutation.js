import { gql } from "@apollo/client";

// Create a Test Paper
export const CREATE_TEST = gql`
  mutation CreateTest(
    $id: ID
    $title: String
    $date: String
    $totalMarks: Int
    $url: String
    $subject: String
    $createdBy: String
    $creatorName: String
  ) {
    createTest(
      id: $id
      title: $title
      date: $date
      totalMarks: $totalMarks
      url: $url
      subject: $subject
      createdBy: $createdBy
      creatorName: $creatorName
    )
  }
`;

// Update Draft Test Papers
export const UPDATE_TESTPAPER = gql`
  mutation UpdateDraftTest(
    $id: ID
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

// Update Faculty Test Paper
export const UPDATE_FACULTY_TESTPAPER = gql`
  mutation UpdateFacultyTest(
    $id: ID
    $title: String
    $subject: String
    $date: String
    $totalMarks: Int
    $url: String
    $published: Boolean
    $createdBy: String
    $creatorName: String
  ) {
    updateFacultyTest(
      id: $id
      title: $title
      subject: $subject
      date: $date
      totalMarks: $totalMarks
      url: $url
      published: $published
      createdBy: $createdBy
      creatorName: $creatorName
    )
  }
`;

// Publish a Test Paper
export const PUBLISH_TESTPAPER = gql`
  mutation PublishTestPaper($id: ID) {
    publishTestPaper(id: $id)
  }
`;

// Update Shared With for Published Tests
export const UPDATE_SHARED_WITH = gql`
  mutation UpdateSharedTest($id: ID, $sharedWith: [TestSharedWithInp]) {
    updateSharedTest(id: $id, sharedWith: $sharedWith)
  }
`;

// Update lockShareWith for the test papers
export const LOCK_SHARED_WITH_TESTPAPER = gql`
  mutation LockSharedWithTest($id: ID, $lockShareWith: Boolean) {
    lockSharedWithTest(id: $id, lockShareWith: $lockShareWith)
  }
`;

// Delete a Test Paper
export const DELETE_TESTPAPER = gql`
  mutation DeleteTest($id: ID, $published: Boolean) {
    deleteTest(id: $id, published: $published)
  }
`;

// Save Test Marks
export const SAVE_TEST_MARKS = gql`
  mutation AddMarks($testId: ID, $data: [MarksInput]) {
    addMarks(testId: $testId, data: $data)
  }
`;

// Mark Test Paper Attendance
export const MARK_TESTPAPER_ATTENDANCE = gql`
  mutation TestAttendanceHandler(
    $id: ID
    $date: String
    $present: [ID]
    $absent: [ID]
  ) {
    testAttendanceHandler(
      id: $id
      date: $date
      present: $present
      absent: $absent
    )
  }
`;
