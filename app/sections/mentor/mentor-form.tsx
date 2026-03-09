import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Iconify } from '@/components/iconify';

import type { MentorProps, MentorFormData, MentorStatus } from './types';
import { EXPERTISE_OPTIONS } from './types';

type MentorFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MentorFormData) => Promise<void>;
  mentor?: MentorProps | null;
  websiteId: string;
  loading?: boolean;
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export function MentorForm({ open, onClose, onSubmit, mentor, websiteId, loading }: MentorFormProps) {
  const [formData, setFormData] = useState<MentorFormData>({
    name: '',
    email: '',
    image: '',
    title: '',
    bio: '',
    expertise: [],
    linkedin: '',
    github: '',
    status: 'ACTIVE',
    websiteId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or mentor changes
  useEffect(() => {
    if (open) {
      if (mentor) {
        setFormData({
          name: mentor.name,
          email: mentor.email || '',
          image: mentor.image || '',
          title: mentor.title || '',
          bio: mentor.bio || '',
          expertise: mentor.expertise,
          linkedin: mentor.linkedin || '',
          github: mentor.github || '',
          status: mentor.status,
          websiteId: mentor.websiteId,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          image: '',
          title: '',
          bio: '',
          expertise: [],
          linkedin: '',
          github: '',
          status: 'ACTIVE',
          websiteId,
        });
      }
      setErrors({});
    }
  }, [open, mentor, websiteId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleExpertiseChange = (event: SelectChangeEvent<typeof formData.expertise>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      expertise: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      status: event.target.value as MentorStatus,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.linkedin && !formData.linkedin.startsWith('http')) {
      newErrors.linkedin = 'Please enter a valid URL (starting with https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save mentor:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mentor ? 'Edit Mentor' : 'Add New Mentor'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Profile Image URL */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Profile Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
            </Grid>

            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title / Role"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Engineer at Google"
              />
            </Grid>

            {/* Bio */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Short bio about the mentor..."
              />
            </Grid>

            {/* Expertise */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Expertise Areas</InputLabel>
                <Select
                  multiple
                  value={formData.expertise}
                  onChange={handleExpertiseChange}
                  input={<OutlinedInput label="Expertise Areas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={EXPERTISE_OPTIONS.find((opt) => opt.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {EXPERTISE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* LinkedIn */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                error={!!errors.linkedin}
                helperText={errors.linkedin}
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>

            {/* GitHub */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="GitHub Username"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="username"
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {mentor ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}