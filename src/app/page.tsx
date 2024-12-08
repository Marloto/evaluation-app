"use client";

import { MainSplitView } from '../components/MainSplitView'
import { ConfigProvider } from '../components/providers/ConfigProvider'
import { ConfigurationManager } from '../components/ConfigurationManager'
import { GradeProvider } from '../components/providers/GradeProvider'

export default function Page() {
  return (
    <ConfigProvider>
      <GradeProvider>
        <ConfigurationManager>
          <MainSplitView />
        </ConfigurationManager>
      </GradeProvider>
    </ConfigProvider>
  );
}