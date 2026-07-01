-- CreateEnum
CREATE TYPE "timetable"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SCHEDULE_MANAGER', 'DEPARTMENT_CHAIR', 'TEACHER', 'STUDENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "timetable"."TeacherType" AS ENUM ('PERMANENT', 'CONTRACT', 'ADJUNCT', 'VISITING');

-- CreateEnum
CREATE TYPE "timetable"."TeacherTrack" AS ENUM ('TEACHING', 'RESEARCH');

-- CreateEnum
CREATE TYPE "timetable"."AvailabilityWindow" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "timetable"."CourseCategory" AS ENUM ('COMPULSORY', 'ELECTIVE', 'ALLIED');

-- CreateEnum
CREATE TYPE "timetable"."ProgramLevel" AS ENUM ('BS', 'MS', 'PHD');

-- CreateEnum
CREATE TYPE "timetable"."SemesterType" AS ENUM ('FALL', 'SPRING', 'SUMMER');

-- CreateEnum
CREATE TYPE "timetable"."RoomType" AS ENUM ('LECTURE_HALL', 'LAB_COMPUTER', 'LAB_PHYSICS', 'LAB_CHEMISTRY', 'LAB_ELECTRONICS', 'SEMINAR_ROOM', 'AUDITORIUM');

-- CreateEnum
CREATE TYPE "timetable"."SolutionStatus" AS ENUM ('DRAFT', 'GENERATING', 'GENERATED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "timetable"."ProbationStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DEGREE_AT_RISK', 'DEFERRED');

-- CreateEnum
CREATE TYPE "timetable"."ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "timetable"."GradingMode" AS ENUM ('RELATIVE', 'ABSOLUTE');

-- CreateTable
CREATE TABLE "timetable"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "timetable"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePwd" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."AccessRestriction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Building" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Room" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "roomType" "timetable"."RoomType" NOT NULL DEFAULT 'LECTURE_HALL',
    "hasProjector" BOOLEAN NOT NULL DEFAULT false,
    "hasAC" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "headId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Program" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "timetable"."ProgramLevel" NOT NULL,
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "totalCredits" INTEGER NOT NULL DEFAULT 130,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."AcademicSemester" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semesterType" "timetable"."SemesterType" NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isSummer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicSemester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Batch" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semesterType" "timetable"."SemesterType" NOT NULL,
    "programId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Course" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditHours" INTEGER NOT NULL DEFAULT 3,
    "labCreditHours" INTEGER NOT NULL DEFAULT 0,
    "category" "timetable"."CourseCategory" NOT NULL DEFAULT 'COMPULSORY',
    "gradingMode" "timetable"."GradingMode" NOT NULL DEFAULT 'RELATIVE',
    "hasLab" BOOLEAN NOT NULL DEFAULT false,
    "isSummerOffered" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."CoursePrerequisite" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "prereqId" TEXT NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."CourseOutline" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseOutline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Roadmap" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."RoadmapEntry" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoadmapEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "teacherType" "timetable"."TeacherType" NOT NULL DEFAULT 'PERMANENT',
    "teacherTrack" "timetable"."TeacherTrack" NOT NULL DEFAULT 'TEACHING',
    "maxCreditHours" INTEGER NOT NULL DEFAULT 9,
    "hasSeniorityExemption" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "officeRoom" TEXT,
    "joinDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."TeacherAvailability" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "semesterId" TEXT,
    "daysAvailable" INTEGER NOT NULL DEFAULT 62,
    "preferredWindow" "timetable"."AvailabilityWindow" NOT NULL DEFAULT 'FLEXIBLE',
    "morningStart" INTEGER,
    "eveningEnd" INTEGER,
    "freeDayCode" INTEGER NOT NULL DEFAULT 8,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."TeacherCoursePreference" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "preferenceLevel" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "TeacherCoursePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."TeacherLeave" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."TeacherExemption" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherExemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "batchPrefix" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL DEFAULT 1,
    "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalCreditsCompleted" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "grade" TEXT,
    "gradePoint" DOUBLE PRECISION,
    "isRepeat" BOOLEAN NOT NULL DEFAULT false,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Section" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "sectionCode" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "enrolled" INTEGER NOT NULL DEFAULT 0,
    "semesterNumber" INTEGER NOT NULL,
    "gradingMode" "timetable"."GradingMode" NOT NULL DEFAULT 'RELATIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."TimePattern" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daysCode" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "slotsPerMtg" INTEGER NOT NULL,
    "breakTime" INTEGER NOT NULL DEFAULT 0,
    "minPerMtg" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TimePattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."ScheduleSolution" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Permutation 1',
    "status" "timetable"."SolutionStatus" NOT NULL DEFAULT 'DRAFT',
    "fitnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "permutationIndex" INTEGER NOT NULL DEFAULT 1,
    "solverParams" JSONB,
    "generatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleSolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."Assignment" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "instructorId" TEXT,
    "roomId" TEXT,
    "timePatternId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "daysCode" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."DistributionConstraint" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "distributionType" TEXT NOT NULL,
    "distributionPref" SMALLINT NOT NULL DEFAULT 0,
    "sectionIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DistributionConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."SchedulingConstraint" (
    "id" TEXT NOT NULL,
    "constraintKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchedulingConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."AcademicProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "semesterGpa" DOUBLE PRECISION NOT NULL,
    "cumulativeCgpa" DOUBLE PRECISION NOT NULL,
    "creditsAttempted" INTEGER NOT NULL,
    "creditsCompleted" INTEGER NOT NULL,
    "totalCreditsCompleted" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."ProbationRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "consecutiveLowCount" INTEGER NOT NULL,
    "status" "timetable"."ProbationStatus" NOT NULL,
    "maxPossibleGpa" DOUBLE PRECISION,
    "requiresDeferment" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProbationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."DefermentRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "selectedCourseIds" TEXT[],
    "timetableJson" JSONB,
    "approvedBy" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefermentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."ImportJob" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "status" "timetable"."ImportStatus" NOT NULL DEFAULT 'PENDING',
    "errorLog" JSONB,
    "importedBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."EmailDispatch" (
    "id" TEXT NOT NULL,
    "toTeacherId" TEXT,
    "toStudentId" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" TEXT[],
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changesBefore" JSONB,
    "changesAfter" JSONB,
    "ipAddress" TEXT,
    "previousHash" TEXT,
    "currentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable"."AppConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "timetable"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "timetable"."UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Building_code_key" ON "timetable"."Building"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Room_code_key" ON "timetable"."Room"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "timetable"."Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "timetable"."Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSemester_code_key" ON "timetable"."AcademicSemester"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_prefix_key" ON "timetable"."Batch"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "timetable"."Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePrerequisite_courseId_prereqId_key" ON "timetable"."CoursePrerequisite"("courseId", "prereqId");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_programId_batchId_key" ON "timetable"."Roadmap"("programId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapEntry_roadmapId_courseId_key" ON "timetable"."RoadmapEntry"("roadmapId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "timetable"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeCode_key" ON "timetable"."Teacher"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherCoursePreference_teacherId_courseId_key" ON "timetable"."TeacherCoursePreference"("teacherId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "timetable"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_registrationNo_key" ON "timetable"."Student"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_sectionId_semesterId_key" ON "timetable"."Enrollment"("studentId", "sectionId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_courseId_programId_semesterId_sectionCode_key" ON "timetable"."Section"("courseId", "programId", "semesterId", "sectionCode");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulingConstraint_constraintKey_key" ON "timetable"."SchedulingConstraint"("constraintKey");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicProgress_studentId_semesterId_key" ON "timetable"."AcademicProgress"("studentId", "semesterId");

-- AddForeignKey
ALTER TABLE "timetable"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "timetable"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Room" ADD CONSTRAINT "Room_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "timetable"."Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "timetable"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "timetable"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prereqId_fkey" FOREIGN KEY ("prereqId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."CourseOutline" ADD CONSTRAINT "CourseOutline_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Roadmap" ADD CONSTRAINT "Roadmap_programId_fkey" FOREIGN KEY ("programId") REFERENCES "timetable"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Roadmap" ADD CONSTRAINT "Roadmap_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "timetable"."Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."RoadmapEntry" ADD CONSTRAINT "RoadmapEntry_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "timetable"."Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."RoadmapEntry" ADD CONSTRAINT "RoadmapEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "timetable"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Teacher" ADD CONSTRAINT "Teacher_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "timetable"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."TeacherAvailability" ADD CONSTRAINT "TeacherAvailability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "timetable"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."TeacherCoursePreference" ADD CONSTRAINT "TeacherCoursePreference_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "timetable"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."TeacherCoursePreference" ADD CONSTRAINT "TeacherCoursePreference_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."TeacherLeave" ADD CONSTRAINT "TeacherLeave_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "timetable"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."TeacherExemption" ADD CONSTRAINT "TeacherExemption_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "timetable"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "timetable"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Student" ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "timetable"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Student" ADD CONSTRAINT "Student_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "timetable"."Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "timetable"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Enrollment" ADD CONSTRAINT "Enrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "timetable"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Enrollment" ADD CONSTRAINT "Enrollment_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "timetable"."AcademicSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "timetable"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Section" ADD CONSTRAINT "Section_programId_fkey" FOREIGN KEY ("programId") REFERENCES "timetable"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Section" ADD CONSTRAINT "Section_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "timetable"."AcademicSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."ScheduleSolution" ADD CONSTRAINT "ScheduleSolution_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "timetable"."AcademicSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Assignment" ADD CONSTRAINT "Assignment_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "timetable"."ScheduleSolution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Assignment" ADD CONSTRAINT "Assignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "timetable"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Assignment" ADD CONSTRAINT "Assignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "timetable"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Assignment" ADD CONSTRAINT "Assignment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "timetable"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."Assignment" ADD CONSTRAINT "Assignment_timePatternId_fkey" FOREIGN KEY ("timePatternId") REFERENCES "timetable"."TimePattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."DistributionConstraint" ADD CONSTRAINT "DistributionConstraint_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "timetable"."ScheduleSolution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."AcademicProgress" ADD CONSTRAINT "AcademicProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "timetable"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."AcademicProgress" ADD CONSTRAINT "AcademicProgress_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "timetable"."AcademicSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."ProbationRecord" ADD CONSTRAINT "ProbationRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "timetable"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."ProbationRecord" ADD CONSTRAINT "ProbationRecord_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "timetable"."AcademicSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."DefermentRecord" ADD CONSTRAINT "DefermentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "timetable"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."EmailDispatch" ADD CONSTRAINT "EmailDispatch_toTeacherId_fkey" FOREIGN KEY ("toTeacherId") REFERENCES "timetable"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."EmailDispatch" ADD CONSTRAINT "EmailDispatch_toStudentId_fkey" FOREIGN KEY ("toStudentId") REFERENCES "timetable"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "timetable"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
