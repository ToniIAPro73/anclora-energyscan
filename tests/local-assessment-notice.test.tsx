import React from 'react';

jest.mock('@react-pdf/renderer', () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children);
  return {
    Document: passthrough,
    Image: passthrough,
    Page: passthrough,
    Text: passthrough,
    View: passthrough,
    StyleSheet: { create: (styles: unknown) => styles },
  };
});

import { BasicReport, type BasicReportData } from '@/lib/pdf/BasicReport';
import { getDictionary } from '@/lib/i18n';
import { LocalEstimateNotice } from '@/components/LocalEstimateNotice';

function collectText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return collectText(node.props.children);
  }
  return '';
}

const baseReport: BasicReportData = {
  assessmentRef: 'LOCAL-SYNTHETIC',
  date: '2026-10-14',
  language: 'es',
  propertyData: { year: 1990, area: 80, zipcode: '00000', propertyType: 'flat' },
  scoreResult: {
    estimatedLetter: 'E',
    confidence: 'Media',
    climateZone: 'C3',
    penalties: [],
    strengths: [],
  },
};

describe('local assessment notice', () => {
  it.each([
    ['es', 'Estimación local no verificada'],
    ['en', 'Unverified local estimate'],
    ['de', 'Ungeprüfte lokale Schätzung'],
    ['ca', 'Estimación local no verificada'],
    ['fr', 'Unverified local estimate'],
    ['it', 'Unverified local estimate'],
    ['pt', 'Unverified local estimate'],
  ])('provides a localized app notice for %s', (language, expected) => {
    expect(getDictionary(language).localEstimateNotice).toContain(expected);
    const notice = LocalEstimateNotice({ message: getDictionary(language).localEstimateNotice });
    expect(collectText(notice)).toContain(expected);
  });

  it.each([
    ['es', 'Estimación local no verificada'],
    ['en', 'Unverified local estimate'],
    ['de', 'Ungeprüfte lokale Schätzung'],
  ] as const)('includes the notice in a local %s PDF', (language, expected) => {
    const report = BasicReport({ data: { ...baseReport, language, isLocalAssessment: true } });
    expect(collectText(report)).toContain(expected);
  });

  it('does not label a saved assessment as a local estimate', () => {
    const report = BasicReport({ data: { ...baseReport, isLocalAssessment: false } });
    expect(collectText(report)).not.toContain('Estimación local no verificada');
  });
});
