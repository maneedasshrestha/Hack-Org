import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';

import type { MentorProps, MentorStatus } from './types';
import { EXPERTISE_LABELS } from './types';

type MentorCardProps = {
  mentor: MentorProps;
  onEdit: (mentor: MentorProps) => void;
  onDelete: (id: string) => void;
};

export function MentorCard({ mentor, onEdit, onDelete }: MentorCardProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const getStatusColor = (status: MentorStatus): 'success' | 'default' => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  const getExpertiseLabel = (value: string): string => {
    return EXPERTISE_LABELS[value] || value;
  };

  return (
    <Card sx={{ position: 'relative' }}>
      {/* Status badge */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <Label
          variant="soft"
          color={getStatusColor(mentor.status)}
        >
          {mentor.status}
        </Label>
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Avatar and basic info */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={mentor.image || undefined}
            alt={mentor.name}
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              fontSize: 24,
            }}
          >
            {mentor.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
            <Typography variant="subtitle1" noWrap fontWeight="fontWeightBold">
              {mentor.name}
            </Typography>
            {mentor.title && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {mentor.title}
              </Typography>
            )}
            {mentor.email && (
              <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block' }}>
                {mentor.email}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Bio */}
        {mentor.bio && (
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {mentor.bio}
          </Typography>
        )}

        {/* Expertise tags */}
        {mentor.expertise.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mentor.expertise.slice(0, 3).map((exp) => (
              <Chip
                key={exp}
                label={getExpertiseLabel(exp)}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            {mentor.expertise.length > 3 && (
              <Chip
                label={`+${mentor.expertise.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Social links */}
        <Stack direction="row" spacing={1}>
          {mentor.linkedin && (
            <Button
              size="small"
              variant="outlined"
              href={mentor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none' }}
            >
              LinkedIn
            </Button>
          )}
          {mentor.github && (
            <Button
              size="small"
              variant="outlined"
              href={`https://github.com/${mentor.github}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none' }}
            >
              GitHub
            </Button>
          )}
        </Stack>

        {/* Actions menu button */}
        <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
          <IconButton onClick={handleOpenPopover} size="small">
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>
      </Stack>

      {/* Actions popover */}
      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 120,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MenuItem
            onClick={() => {
              onEdit(mentor);
              handleClosePopover();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ mr: 1.5 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete(mentor.id);
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1.5 }} />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </Card>
  );
}