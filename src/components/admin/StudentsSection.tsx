import { Class } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import StudentActions from "@/components/StudentActions";
import { useState } from "react";

interface StudentsSectionProps {
  selectedClass: Class;
  onAddStudent: (values: { studentName: string }) => void;
  onBack: () => void;
  onPhotoUploaded: (studentId: string, photoUrl: string) => void;
}

export const StudentsSection = ({ selectedClass, onAddStudent, onBack, onPhotoUploaded }: StudentsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const studentForm = useForm({
    defaultValues: {
      studentName: "",
    },
  });

  const handleSubmit = async (values: { studentName: string }) => {
    await onAddStudent(values);
    setIsOpen(false);
    studentForm.reset();
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Alunos da Turma {selectedClass.name}
        </h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>
            Voltar às Turmas
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Aluno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              </DialogHeader>
              <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={studentForm.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Aluno</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduza o nome do aluno" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Adicionar Aluno</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Aluno</TableHead>
            <TableHead>Código de Acesso</TableHead>
            <TableHead>Fotografia</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedClass.students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.access_code}</TableCell>
              <TableCell>
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  "Sem fotografia"
                )}
              </TableCell>
              <TableCell>
                <StudentActions
                  student={student}
                  onPhotoUploaded={onPhotoUploaded}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};