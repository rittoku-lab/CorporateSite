import DefaultTheme from 'vitepress/theme';
import ServiceFeedbackForm from './components/ServiceFeedbackForm.vue';
import type { Theme } from 'vitepress';

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ServiceFeedbackForm', ServiceFeedbackForm);
  },
};

export default theme;
