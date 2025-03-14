# Fees Tracking Backend Changes

This document outlines the backend changes needed to fully implement the fees tracking feature in the Shishyakul application.

## Overview

The fees tracking feature allows administrators to:

1. Set a total fees amount for each student
2. Track fees paid by payment method
3. Calculate remaining balance
4. Visualize payment methods with a bar chart

## Required Backend Changes

### 1. Update Student Schema

Add a `totalFees` field to the Student schema:

```graphql
type Student {
  # Existing fields
  userId: ID!
  email: String!
  firstname: String!
  middlename: String
  lastname: String!
  phone: String!
  ay: String!
  grade: String!
  batch: String

  # New field
  totalFees: Int

  # Existing fields
  attendance: Attendance!
  fees: [Fee!]!
  # Other fields...
}
```

### 2. Add GraphQL Mutation

Add a new mutation to update the student's total fees:

```graphql
type Mutation {
  # Existing mutations...

  # New mutation
  updateStudentTotalFees(userId: ID!, totalFees: Int!): Boolean!
}
```

### 3. Implement Resolver

Implement the resolver for the `updateStudentTotalFees` mutation:

```javascript
// Example implementation (adjust based on your actual backend structure)
const resolvers = {
  Mutation: {
    // Existing resolvers...

    updateStudentTotalFees: async (_, { userId, totalFees }, context) => {
      try {
        // Update the student document in your database
        // Example for Firebase Firestore:
        const studentRef = db.collection("students").doc(userId);
        await studentRef.update({ totalFees });
        return true;
      } catch (error) {
        console.error("Error updating student total fees:", error);
        return false;
      }
    },
  },
};
```

## Implementation Notes

1. The frontend has been updated to handle the case where the `totalFees` field might not be available yet.
2. A fallback calculation is provided to estimate total fees based on existing fee data.
3. Once the backend changes are implemented, the frontend will use the actual `totalFees` value from the database.

## Testing

After implementing these changes:

1. Test setting the total fees for a student using the "Edit Fee Details" button
2. Verify that the total fees value is saved and displayed correctly
3. Test adding new fee payments and verify that the fees paid and balance are calculated correctly
4. Verify that the payment methods bar chart displays correctly
