import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/apiClient';

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data } = await apiClient.get('/issues');
      return data;
    },
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newIssue) => {
      const { data } = await apiClient.post('/issues', newIssue);
      return data;
    },
    onSuccess: () => {
      // This tells React Query to instantly re-fetch the board data!
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Using the spread operator (...updateData) so we can pass title, priority, AND/OR status
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await apiClient.put(`/issues/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/issues/${id}`);
      return data;
    },
    onSuccess: () => {
      // Instantly refresh the board when the deletion is successful
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};