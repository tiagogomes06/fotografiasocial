import { Student } from "../types/admin";
import StudentPhotoUpload from "./StudentPhotoUpload";
import StudentQRCode from "./StudentQRCode";

interface StudentActionsProps {
  student: Student;
  onPhotoUploaded: (studentId: string, photoUrl: string) => void;
}

const StudentActions = ({ student, onPhotoUploaded }: StudentActionsProps) => {
  return (
    <div className="flex gap-2">
      <StudentPhotoUpload
        studentId={student.id}
        studentName={student.name}
        onPhotoUploaded={(photoUrl) => onPhotoUploaded(student.id, photoUrl)}
      />
      <StudentQRCode
        accessCode={student.access_code}
        studentName={student.name}
      />
    </div>
  );
};

export default StudentActions;