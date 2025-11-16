import { useEffect, useRef } from 'react';
import './AboutPage.css';

const AboutPage = () => {
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.p5) return;
    if (p5InstanceRef.current) return;

    let s = 0;

    const sketch = (p) => {
      p.setup = () => {
        const container = document.querySelector('.about-page');
        const height = container ? container.scrollHeight : window.innerHeight;

        const canvas = p.createCanvas(200, height);
        canvas.parent('p5-canvas-container');
        p.background(255, 0);
      };

      p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width / 2, p.height);
        plant(p, s);
        p.pop();
      };

      p.mousePressed = () => {
        s = s + 10;
      };

      const plant = (p, h) => {
        p.push();
        p.scale(0.8);

        // 줄기
        p.stroke(0);
        p.strokeWeight(8);
        p.line(0, 0, 0, -h);

        // 꽃머리
        p.push();
        p.translate(0, -h);
        p.strokeWeight(3);
        p.ellipse(0, -25, 30, 30);
        p.ellipse(20, -10, 30, 30);
        p.ellipse(13, 15, 30, 30);
        p.ellipse(-20, -10, 30, 30);
        p.ellipse(-13, 15, 30, 30);
        p.ellipse(0, 0, 40, 40);
        p.pop();

        if (h > 100) {
          // 잎사귀
          p.push();
          p.translate(0, -h + 70);
          p.strokeWeight(3);
          p.ellipse(25, 0, 50, 20);
          p.ellipse(-25, 0, 50, 20);
          p.pop();
        }

        p.pop();
      };
    };

    p5InstanceRef.current = new window.p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1 className="about-main-title">모닝페이지 사용 안내 🌞</h1>
          <p className="about-subtitle">
            모닝페이지는 사용자가 자신의 GitHub 저장소를 기반으로 일상을 기록하고, 
            창작적 사고를 확장할 수 있도록 돕는 서버리스 서비스입니다. 
            아래 안내에 따라 설정하면 바로 이용할 수 있습니다.
          </p>
        </header>

        <section className="about-section">
          <h2 className="about-section-title">1. 시작하기</h2>
          
          <div className="about-subsection">
            <h3 className="about-subsection-title">저장소 생성</h3>
            <ol className="about-list">
              <li>모닝페이지를 기록할 전용 저장소를 <strong>private</strong>으로 생성합니다.</li>
              <li>
                다음 템플릿을 다운로드하고, 저장소 최상단에 <code>.morningpage</code> 폴더를 추가합니다.
                <div className="about-link-box">
                  템플릿: <a 
                    href="https://github.com/sotogito/morningpage-template.git" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="about-link"
                  >
                    https://github.com/sotogito/morningpage-template.git
                  </a>
                </div>
              </li>
            </ol>
          </div>

          <div className="about-subsection">
            <h3 className="about-subsection-title">로그인</h3>
            <ul className="about-list">
              <li>생성한 저장소의 URL과 GitHub Personal Access Token(PAT)을 사용해 로그인합니다.</li>
              <li>모닝페이지는 보안을 위해 <strong>캐시를 사용하지 않습니다.</strong></li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">2. 모닝페이지 약속</h2>
          <ol className="about-list about-promise-list">
            <li>아침에 일어나 바로 작성하는 것을 권장합니다.</li>
            <li>작성 중인 글은 삭제할 수 없습니다. 오타도 괜찮습니다.</li>
            <li>저장된 파일은 수정·삭제가 불가합니다. 생각을 수정할 필요 없습니다.</li>
            <li><strong>1,000자 이상 작성해야 저장</strong>할 수 있습니다. 너무 깊은 생각을 할 필요 없습니다. 아무 말이나 작성해도 좋습니다.</li>
            <li>하루에 한 번만 작성할 수 있습니다. 날짜는 자동으로 구분됩니다.</li>
          </ol>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">3. 제공 기능</h2>

          <div className="about-feature">
            <h3 className="about-feature-title">1) 에디터</h3>
            <ul className="about-list">
              <li>저장소 내 <code>.md</code> 파일을 읽어오고, 모닝페이지 양식에 맞는 파일만 표시합니다.</li>
              <li>
                기본 폴더 구조는 다음과 같습니다.
                <pre className="about-code-block">
{`.morningpage
└── 1월
    └── 1째주
        ├── 2025-01-01 모닝페이지 첫 시작.md
        └── 2025-01-02.md`}
                </pre>
              </li>
              <li>
                기본 제목은 오늘 날짜로 자동 생성되며, 다음 형태를 지원합니다.
                <ul className="about-sublist">
                  <li><code>YYYY-MM-DD</code></li>
                  <li><code>YYYY-MM-DD 제목</code></li>
                </ul>
              </li>
              <li>마크다운을 적용한 미리보기 기능을 제공합니다.</li>
            </ul>
          </div>

          <div className="about-feature">
            <h3 className="about-feature-title">2) 즐겨찾기</h3>
            <ul className="about-list">
              <li><code>.morningpage/favorites.json</code> 파일에 저장됩니다.</li>
              <li>예: <code>1월/1째주/YYYY-MM-DD</code> 형태로 등록 가능</li>
            </ul>
          </div>

          <div className="about-feature">
            <h3 className="about-feature-title">3) 통계</h3>
            
            <div className="about-subfeature">
              <h4 className="about-subfeature-title">기여도(히트맵)</h4>
              <ul className="about-list">
                <li>날짜별 작성 여부를 시각적으로 확인할 수 있습니다.</li>
                <li>
                  작성 시각에 따라 색상이 변화합니다.
                  <ul className="about-sublist">
                    <li>이른 아침: 초록</li>
                    <li>낮: 노랑</li>
                    <li>늦은 저녁: 빨강</li>
                  </ul>
                </li>
                <li>특정 칸을 클릭하면 해당 파일로 이동합니다.</li>
              </ul>
            </div>

            <div className="about-subfeature">
              <h4 className="about-subfeature-title">작성 통계</h4>
              <ul className="about-list">
                <li><code>.morningpage/status.json</code> 파일로 관리됩니다.</li>
                <li>총 작성일</li>
                <li>연속 작성일(스트릭)</li>
                <li>마지막 작성일</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">4. AI를 활용한 나의 창조성과 대화하기</h2>
          <p className="about-description">
            모닝페이지는 개인의 창조성을 확장하기 위해 AI와 연결할 수 있는 파일 구조를 제공합니다.
          </p>

          <ul className="about-list about-ai-list">
            <li>
              <code>.morningpage/ai/system.txt</code>
              <p className="about-list-description">기본 프롬프트이며, 수정은 권장되지 않습니다.</p>
            </li>
            <li>
              <code>.morningpage/ai/instructions.md</code>
              <p className="about-list-description">AI에게 전달되는 지침서입니다.</p>
            </li>
            <li>
              <code>.morningpage/user_prompt.md</code>
              <p className="about-list-description">사용자가 직접 편집해 추가 프롬프트를 설정할 수 있는 파일입니다.</p>
            </li>
          </ul>

          <div className="about-subsection">
            <h3 className="about-subsection-title">사용 방법</h3>
            <ol className="about-list">
              <li>해당 파일을 로컬에 저장합니다.</li>
              <li>AI 툴에서 파일을 불러옵니다.</li>
              <li>파일 기반으로 AI와 대화를 시작합니다.</li>
            </ol>
            <div className="about-note">
              <p>전체 파일 구조를 기반으로 작동하는 AI가 필요합니다.</p>
              <p>Cursor, Claude Code 등을 권장합니다.</p>
            </div>
          </div>
        </section>

        <section className="about-section about-section-last">
          <h2 className="about-section-title">5. 기타 안내</h2>
          <ul className="about-list">
            <li>모닝페이지는 <strong>서버리스 구조</strong>로 동작합니다.</li>
            <li>GitHub PAT 기반으로 로그인하며, 모든 기록은 사용자의 개인 GitHub 저장소에 저장됩니다.</li>
            <li>템플릿 없이도 사용 가능하지만, 즐겨찾기 및 일부 통계 기능이 제한됩니다.</li>
            <li>연도별로 저장소를 따로 관리하는 방식을 권장합니다.</li>
          </ul>
        </section>
      </div>
      
      <div id="p5-canvas-container" className="p5-canvas-wrapper"></div>
    </div>
  );
};

export default AboutPage;
