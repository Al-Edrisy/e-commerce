import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Mail, Calendar, Search, Filter } from 'lucide-react';
import { User } from '@/types';
import { toast } from 'sonner';

// Mock customers data
const mockCustomers: User[] = [
  {
    uid: '1',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    photoURL: undefined,
    createdAt: new Date(2024, 0, 15).toISOString(),
    role: 'customer',
  },
  {
    uid: '2',
    displayName: 'Jane Smith',
    email: 'jane.smith@example.com',
    photoURL: undefined,
    createdAt: new Date(2024, 1, 10).toISOString(),
    role: 'customer',
  },
  {
    uid: '3',
    displayName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    photoURL: undefined,
    createdAt: new Date(2024, 2, 5).toISOString(),
    role: 'customer',
  },
  {
    uid: '4',
    displayName: 'Alice Williams',
    email: 'alice.williams@example.com',
    photoURL: undefined,
    createdAt: new Date(2024, 2, 20).toISOString(),
    role: 'admin',
  },
];

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<User[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [customers, searchQuery, roleFilter]);

  const handleRoleChange = (uid: string, newRole: 'customer' | 'admin') => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.uid === uid ? { ...customer, role: newRole } : customer
      )
    );
    toast.success(`User role updated to ${newRole}`);
  };

  const totalCustomers = filteredCustomers.length;
  const adminCount = filteredCustomers.filter(c => c.role === 'admin').length;
  const customerCount = filteredCustomers.filter(c => c.role === 'customer').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">View and manage customer accounts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="text-2xl font-bold">{totalCustomers}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <div className="text-2xl font-bold">{customerCount}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              <div className="text-2xl font-bold">{adminCount}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search-customers">Search Customers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-customers"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No customers found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                  <TableRow key={customer.uid}>
                    <TableCell className="font-medium">{customer.displayName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={customer.role}
                        onValueChange={(value: 'customer' | 'admin') => 
                          handleRoleChange(customer.uid, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomers;
