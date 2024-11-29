import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Upload, QrCode } from "lucide-react";
import { useState } from "react";

interface School {
  id: string;
  name: string;
  className: string;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  code: string;
  photoUrl?: string;
}

const Admin = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const form = useForm({
    defaultValues: {
      schoolName: "",
      className: "",
    },
  });

  const onSubmit = (values: { schoolName: string; className: string }) => {
    const newSchool: School = {
      id: crypto.randomUUID(),
      name: values.schoolName,
      className: values.className,
      students: [],
    };
    setSchools([...schools, newSchool]);
    form.reset();
  };

  const handlePhotoUpload = (schoolId: string) => {
    // TODO: Implement photo upload functionality
    console.log("Upload photos for school:", schoolId);
  };

  const handleGenerateQR = (schoolId: string) => {
    // TODO: Implement QR code generation
    console.log("Generate QR codes for school:", schoolId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container pt-32 pb-16">
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Schools & Classes</h2>
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
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
                    <FormField
                      control={form.control}
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
                    <Button type="submit" className="w-full">Add School</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.className}</TableCell>
                    <TableCell>{school.students.length}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePhotoUpload(school.id)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Photos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateQR(school.id)}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          Generate QR
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Admin;