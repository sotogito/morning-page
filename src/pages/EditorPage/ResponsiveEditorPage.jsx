import EditorPage from './EditorPage';
import EditorPageMobile from './EditorPageMobile';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ResponsiveEditorPage = () => {
  const isMobile = useMediaQuery('(max-width: 900px)');

  return isMobile ? <EditorPageMobile /> : <EditorPage />;
};

export default ResponsiveEditorPage;
