import { School } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Users, School as SchoolIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface SchoolsSectionProps {
  schools: School[];
  onAddSchool: (values: { schoolName: string }) => void;
  onSelectSchool: (school: School) => void;
}

export const SchoolsSection = ({ schools, onAddSchool, onSelectSchool }: SchoolsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const schoolForm = useForm({
    defaultValues: {
      schoolName: "",
    },
  });

  const handleSubmit = (values: { schoolName: string }) => {
    onAddSchool(values);
    setIsOpen(false);
    schoolForm.reset();
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <SchoolIcon className="h-8 w-8" />
          Schools
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <form onSubmit={schoolForm.handleSubmit(handleSubmit)} className="space-y-4">
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
                  onClick={() => onSelectSchool(school)}
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
  );
};