"use client";

import { MainSplitView } from '../components/MainSplitView'
import { ConfigProvider } from '../components/providers/ConfigProvider'
import { ConfigurationManager } from '../components/ConfigurationManager'
import { GradeProvider } from '../components/providers/GradeProvider'
import { AiProvider } from '../components/providers/AiProvider'
import AiConsoleBridge from '../components/AiConsoleBridge'

export default function Page() {
  return (
    <ConfigProvider>
      <GradeProvider>
        <AiProvider>
          <AiConsoleBridge />
          <ConfigurationManager>
            <MainSplitView />
          </ConfigurationManager>
        </AiProvider>
      </GradeProvider>
    </ConfigProvider>
  );
}
