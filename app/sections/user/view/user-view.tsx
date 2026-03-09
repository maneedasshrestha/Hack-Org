import { useState, useCallback, useEffect } from 'react';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';


import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { ParticipantProps, ParticipantStatus } from '../user-table-row';
import { DashboardContent } from '@/app/layouts/dashboard';
import { Iconify } from '@/components/iconify';
import { Scrollbar } from '@/components/scrollbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Hackathon = {
  id: number;
  slug: string;
  title: string;
  status: string;
};

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin's hackathons on mount
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        // Get adminId from localStorage (set during admin login)
        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
          setHackathonsLoading(false);
          setError('Please log in as an admin to view participants');
          return;
        }

        const response = await fetch(`${API_URL}/websites/admin/${adminId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch hackathons');
        }

        const data = await response.json();
        setHackathons(data.websites || []);

        // Auto-select first hackathon if available
        if (data.websites && data.websites.length > 0) {
          setSelectedHackathonId(data.websites[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching hackathons:', err);
        setError('Failed to load hackathons');
      } finally {
        setHackathonsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  // Fetch participants when hackathon is selected
  useEffect(() => {
    if (!selectedHackathonId) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/registration/website/${selectedHackathonId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch participants');
        }

        const data = await response.json();

        // Transform registrations to participant format
        const transformedParticipants: ParticipantProps[] = (data.registrations || []).map(
          (reg: any) => ({
            id: reg.id.toString(),
            name: reg.user?.name || 'Unknown',
            email: reg.user?.email || '',
            githubUsername: reg.user?.githubUsername || '',
            avatarUrl: reg.user?.image || '',
            registeredAt: reg.registeredAt,
            status: reg.status as ParticipantStatus,
          })
        );

        setParticipants(transformedParticipants);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [selectedHackathonId]);

  // Handle status change
  const handleStatusChange = async (registrationId: string, newStatus: ParticipantStatus) => {
    try {
      const response = await fetch(`${API_URL}/registration/${registrationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setParticipants((prev) =>
        prev.map((p) => (p.id === registrationId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update participant status');
    }
  };

  const dataFiltered: ParticipantProps[] = applyFilter({
    inputData: participants,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Participants
        </Typography>

        {/* Hackathon Selector */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="hackathon-select-label">Select Hackathon</InputLabel>
          <Select
            labelId="hackathon-select-label"
            value={selectedHackathonId}
            label="Select Hackathon"
            onChange={(e) => setSelectedHackathonId(e.target.value)}
            disabled={hackathonsLoading || hackathons.length === 0}
          >
            {hackathons.map((hackathon) => (
              <MenuItem key={hackathon.id} value={hackathon.id.toString()}>
                {hackathon.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <UserTableToolbar
            numSelected={table.selected.length}
            filterName={filterName}
            onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilterName(event.target.value);
              table.onResetPage();
            }}
          />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={participants.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      participants.map((user) => user.id)
                    )
                  }
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'githubUsername', label: 'GitHub' },
                    { id: 'registeredAt', label: 'Registered' },
                    { id: 'status', label: 'Status' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onStatusChange={handleStatusChange}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, participants.length)}
                  />

                  {notFound && <TableNoData searchQuery={filterName} />}
                  {!notFound && participants.length === 0 && !loading && (
                    <TableNoData searchQuery="" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        <TablePagination
          component="div"
          page={table.page}
          count={participants.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
