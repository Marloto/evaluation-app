import { MainSplitView } from '../components/MainSplitView'
import { ConfigProvider } from '../components/ConfigProvider'
import { ConfigurationManager } from '../components/ConfigurationManager'

export default function Page() {
  return (
    <ConfigProvider>
      <ConfigurationManager>
        <MainSplitView />
      </ConfigurationManager>
    </ConfigProvider>
  );
}