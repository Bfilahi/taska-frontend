import { Routes } from '@angular/router';
import { HomePage } from './components/pages/home-page/home-page';
import { PageNotFound } from './components/pages/page-not-found/page-not-found';
import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';

export const routes: Routes = [
  { path: '', component: HomePage, canActivate: [publicGuard] },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboardContainer/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/sidenavContainer/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./components/projectsContainer/projects/projects').then((m) => m.Projects),
      },
      {
        path: 'project-details',
        loadComponent: () =>
          import(
            './components/projectsContainer/projectDetailContainer/project-detail/project-detail'
          ).then((m) => m.ProjectDetail),
      },
      {
        path: 'task-details',
        loadComponent: () =>
          import('./components/tasksContainer/taskDetailsContainer/task-details/task-details').then(
            (m) => m.TaskDetails),
      },
    ],
  },

  { path: '**', component: PageNotFound },
];
