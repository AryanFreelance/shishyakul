/**
 * Utility functions for handling faculty permissions and filtering students based on faculty assignments
 */

/**
 * Filters students based on faculty assignments
 * @param {Array} students - Array of student objects
 * @param {Array} facultyAssignments - Faculty assignments array from the faculty member document
 * @returns {Array} - Filtered array of students that match faculty assignments
 */
export const filterStudentsForFaculty = (students, facultyAssignments) => {
    if (!facultyAssignments || facultyAssignments.length === 0) {
        return [];
    }

    return students.filter(student => {
        // For each student, check if they match any faculty assignment
        return facultyAssignments.some(assignment => {
            // If no specific grade or batch is specified (all), then match just on academic year
            if (
                assignment.academicYear === student.academicYear &&
                (assignment.grade === "all" || !assignment.grade) &&
                (assignment.batch === "all" || !assignment.batch)
            ) {
                return true;
            }

            // If specific grade is specified but batch is all or empty
            if (
                assignment.academicYear === student.academicYear &&
                assignment.grade === student.grade &&
                (assignment.batch === "all" || !assignment.batch)
            ) {
                return true;
            }

            // If both specific grade and batch are specified
            if (
                assignment.academicYear === student.academicYear &&
                assignment.grade === student.grade &&
                assignment.batch === student.batch
            ) {
                return true;
            }

            return false;
        });
    });
};

/**
 * Determines if a user has access to view a specific student
 * @param {Object} user - The current user object with roles and facultyAssignments
 * @param {Object} student - The student to check access for
 * @returns {Boolean} - Whether the user has access to this student
 */
export const hasStudentAccess = (user, student) => {
    // Admin or user with Content role has access to all students
    if (user.roles?.Content) {
        return true;
    }

    // Faculty member only has access to assigned students
    if (user.roles?.Faculty && user.facultyAssignments) {
        return filterStudentsForFaculty([student], user.facultyAssignments).length > 0;
    }

    return false;
};

/**
 * Checks if a user has access to a specific page based on their roles
 * @param {Object} user - The current user object with roles
 * @param {String} page - The page to check access for
 * @returns {Boolean} - Whether the user has access to this page
 */
export const hasPageAccess = (user, page) => {
    if (!user || !user.roles) return false;

    // Admin (Content role) has access to all pages
    if (user.roles.Content) {
        return true;
    }

    // Page-specific permissions
    switch (page) {
        case 'students':
            return user.roles.Students || user.roles.Faculty;
        case 'fees':
            return user.roles.Fees;
        case 'content':
            return user.roles.Content;
        case 'birthdays':
            return user.roles.Birthdays || user.roles.Faculty;
        case 'tests':
            return user.roles.Faculty;
        case 'attendance':
            return user.roles.Faculty;
        default:
            return false;
    }
}; 