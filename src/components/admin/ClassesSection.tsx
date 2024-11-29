import { School, Class } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface ClassesSectionProps {
  school: School;
  onAddClass: (values: { className: string }) => void;
  onSelectClass: (cls: Class) => void;
  onBack: () => void;
}

export const ClassesSection = ({ school, onAddClass, onSelectClass, onBack }: ClassesSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const classForm = useForm({
    defaultValues: {
      className: "",
    },
  });

  const handleSubmit = (values: { className: string }) => {
    onAddClass(values);
    setIsOpen(false);
    classForm.reset();
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Classes for {school.name}
        </h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>
            Back to Schools
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <form onSubmit={classForm.handleSubmit(handleSubmit)} className="space-y-4">
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
          {school.classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.students.length}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectClass(cls)}
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
  );
};