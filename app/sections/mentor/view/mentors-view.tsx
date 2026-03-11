import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { Iconify } from '@/components/iconify';
import { DashboardContent } from '@/app/layouts/dashboard';
import { useHackathon } from '@/contexts/HackathonContext';

import { MentorCard } from '../mentor-card';
import { MentorForm } from '../mentor-form';
import type { MentorProps, MentorFormData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function MentorsView() {
  const [mentors, setMentors] = useState<MentorProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<MentorProps | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mentorToDelete, setMentorToDelete] = useState<string | null>(null);

  // Use global hackathon context
  const {
    selectedHackathonId,
    selectedHackathonName,
    hackathons,
    loading: hackathonsLoading,
    setSelectedHackathon,
  } = useHackathon();

  // Fetch mentors when hackathon is selected
  useEffect(() => {
    if (!selectedHackathonId) {
      setMentors([]);
      return;
    }

    const fetchMentors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/mentor/hackathon/${selectedHackathonId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch mentors');
        }

        const data = await response.json();

        // Transform mentors to the expected format
        const transformedMentors: MentorProps[] = (data.mentors || []).map(
          (mentor: any) => ({
            id: mentor.id.toString(),
            name: mentor.name,
            email: mentor.email || '',
            image: mentor.image || '',
            title: mentor.title || '',
            bio: mentor.bio || '',
            expertise: mentor.expertise || [],
            linkedin: mentor.linkedin || '',
            github: mentor.github || '',
            status: mentor.status as 'ACTIVE' | 'INACTIVE',
            websiteId: mentor.websiteId.toString(),
            createdAt: mentor.createdAt,
          })
        );

        setMentors(transformedMentors);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [selectedHackathonId]);

  // Handle create mentor
  const handleCreateMentor = useCallback(() => {
    setEditingMentor(null);
    setFormOpen(true);
  }, []);

  // Handle edit mentor
  const handleEditMentor = useCallback((mentor: MentorProps) => {
    setEditingMentor(mentor);
    setFormOpen(true);
  }, []);

  // Handle delete mentor
  const handleDeleteClick = useCallback((id: string) => {
    setMentorToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!mentorToDelete) return;

    try {
      const response = await fetch(`${API_URL}/mentor/${mentorToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mentor');
      }

      setMentors((prev) => prev.filter((m) => m.id !== mentorToDelete));
      setDeleteDialogOpen(false);
      setMentorToDelete(null);
    } catch (err) {
      console.error('Error deleting mentor:', err);
      alert('Failed to delete mentor');
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: MentorFormData) => {
    setFormLoading(true);
    try {
      const payload = {
        ...data,
        hackathonId: selectedHackathonId,
      };

      let response;
      if (editingMentor) {
        // Update existing mentor
        response = await fetch(`${API_URL}/mentor/${editingMentor.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new mentor
        response = await fetch(`${API_URL}/mentor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save mentor');
      }

      const result = await response.json();

      // Refresh mentors list
      const mentorsResponse = await fetch(`${API_URL}/mentor/hackathon/${selectedHackathonId}`);
      if (mentorsResponse.ok) {
        const mentorsData = await mentorsResponse.json();
        const transformedMentors: MentorProps[] = (mentorsData.mentors || []).map(
          (mentor: any) => ({
            id: mentor.id.toString(),
            name: mentor.name,
            email: mentor.email || '',
            image: mentor.image || '',
            title: mentor.title || '',
            bio: mentor.bio || '',
            expertise: mentor.expertise || [],
            linkedin: mentor.linkedin || '',
            github: mentor.github || '',
            status: mentor.status as 'ACTIVE' | 'INACTIVE',
            websiteId: mentor.websiteId.toString(),
            createdAt: mentor.createdAt,
          })
        );
        setMentors(transformedMentors);
      }

      setFormOpen(false);
      setEditingMentor(null);
    } catch (err) {
      console.error('Error saving mentor:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle hackathon selection change - sync with global state
  const handleHackathonChange = (hackathonId: string) => {
    const hackathon = hackathons.find(h => h.id === hackathonId);
    if (hackathon) {
      setSelectedHackathon(hackathon.id, hackathon.name);
    }
  };

  return (
    <DashboardContent>
      {/* Header */}
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
          Mentors
        </Typography>

        {/* Hackathon Selector - synced with global state */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="hackathon-select-label">Select Hackathon</InputLabel>
          <Select
            labelId="hackathon-select-label"
            value={selectedHackathonId || ''}
            label="Select Hackathon"
            onChange={(e) => handleHackathonChange(e.target.value)}
            disabled={hackathonsLoading || hackathons.length === 0}
          >
            {hackathons.map((hackathon) => (
              <MenuItem key={hackathon.id} value={hackathon.id}>
                {hackathon.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Add Mentor Button */}
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleCreateMentor}
          disabled={!selectedHackathonId}
        >
          Add Mentor
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {hackathonsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : !selectedHackathonId ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Select a hackathon to view mentors
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Mentors Grid */}
          {mentors.length > 0 ? (
            <Grid container spacing={3}>
              {mentors.map((mentor) => (
                <Grid key={mentor.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <MentorCard
                    mentor={mentor}
                    onEdit={handleEditMentor}
                    onDelete={handleDeleteClick}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Empty State */
            <Card sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Mentors Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add mentors to your hackathon to help guide participants.
              </Typography>
              {selectedHackathonId && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleCreateMentor}
                >
                  Add Your First Mentor
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* Mentor Form Dialog */}
      <MentorForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingMentor(null);
        }}
        onSubmit={handleFormSubmit}
        mentor={editingMentor}
        websiteId={selectedHackathonId || ''}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Mentor?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this mentor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}