// app/page.tsx
import { MainSplitView } from '../components/MainSplitView'
import { ConfigProvider } from '../components/ConfigProvider'
import { ConfigurationManager } from '../components/ConfigurationManager'
import { GradeProvider } from '../components/GradeProvider'

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