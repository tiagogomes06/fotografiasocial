import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Users, School as SchoolIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StudentActions from "@/components/StudentActions";
import { School, Class, Student } from "@/types/admin";
import { createSchool, createClass, createStudent, fetchSchools } from "@/utils/supabaseHelpers";

const Admin = () => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const queryClient = useQueryClient();
  
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  const schoolForm = useForm({
    defaultValues: {
      schoolName: "",
    },
  });

  const classForm = useForm({
    defaultValues: {
      className: "",
    },
  });

  const studentForm = useForm({
    defaultValues: {
      studentName: "",
    },
  });

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const schoolMutation = useMutation({
    mutationFn: (values: { schoolName: string }) => createSchool(values.schoolName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      schoolForm.reset();
      toast.success("School added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add school");
      console.error(error);
    },
  });

  const classMutation = useMutation({
    mutationFn: (values: { className: string }) => {
      if (!selectedSchool) throw new Error("No school selected");
      return createClass(values.className, selectedSchool.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      classForm.reset();
      toast.success("Class added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add class");
      console.error(error);
    },
  });

  const studentMutation = useMutation({
    mutationFn: (values: { studentName: string }) => {
      if (!selectedClass) throw new Error("No class selected");
      const accessCode = generateAccessCode();
      return createStudent(values.studentName, selectedClass.id, accessCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      studentForm.reset();
      toast.success("Student added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add student");
      console.error(error);
    },
  });

  const onSubmitSchool = (values: { schoolName: string }) => {
    schoolMutation.mutate(values);
  };

  const onSubmitClass = (values: { className: string }) => {
    classMutation.mutate(values);
  };

  const onSubmitStudent = (values: { studentName: string }) => {
    studentMutation.mutate(values);
  };

  const handlePhotoUploaded = async (studentId: string, photoUrl: string) => {
    queryClient.invalidateQueries({ queryKey: ['schools'] });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container pt-32 pb-16 space-y-8">
        {/* Schools Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <SchoolIcon className="h-8 w-8" />
              Schools
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add School
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                </DialogHeader>
                <Form {...schoolForm}>
                  <form onSubmit={schoolForm.handleSubmit(onSubmitSchool)} className="space-y-4">
                    <FormField
                      control={schoolForm.control}
                      name="schoolName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter school name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Add School</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.classes.length}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSchool(school)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Manage Classes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Classes Section */}
        {selectedSchool && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Classes for {selectedSchool.name}
              </h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                  Back to Schools
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Class</DialogTitle>
                    </DialogHeader>
                    <Form {...classForm}>
                      <form onSubmit={classForm.handleSubmit(onSubmitClass)} className="space-y-4">
                        <FormField
                          control={classForm.control}
                          name="className"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter class name" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">Add Class</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSchool.classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.students.length}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Manage Students
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* Students Section */}
        {selectedClass && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Students in {selectedClass.name}
              </h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedClass(null)}>
                  Back to Classes
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                    <Form {...studentForm}>
                      <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4">
                        <FormField
                          control={studentForm.control}
                          name="studentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter student name" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">Add Student</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Actions</TableHead>
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
                        "No photo"
                      )}
                    </TableCell>
                    <TableCell>
                      <StudentActions
                        student={student}
                        onPhotoUploaded={handlePhotoUploaded}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;
