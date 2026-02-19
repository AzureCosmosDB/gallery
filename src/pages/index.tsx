import React from 'react';
import Layout from '@theme/Layout';
import HomePage from '../components/home/HomePage';

const TITLE = 'The PostgreSQL Gallery';
const DESCRIPTION = 'A collection of PostgreSQL resources, templates, and best practices';

// eslint-disable-next-line import/no-unused-modules
export default function Home(): JSX.Element {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <HomePage />
    </Layout>
  );
}
