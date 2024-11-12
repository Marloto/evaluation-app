// config/evaluation-config.ts
import { EvaluationConfig } from '../types/types';

export const evaluationConfig: EvaluationConfig = {
    sections: {
      preface: {
        title: "Vorwort",
        weight: 0.2,
        criteria: {
          independence: {
            title: "Selbstständigkeit",
            weight: 0.3,
            options: [
              { text: "Die Problembearbeitung erfolgte mit häufiger Unterstützung", score: 1 },
              { text: "Die Problembearbeitung erfolgte mit regelmäßiger Unterstützung, zeigte aber eigene Ansätze", score: 2 },
              { text: "Die Problembearbeitung erfolgte weitgehend selbstständig", score: 3 },
              { text: "Die Problembearbeitung erfolgte selbstständig und zielgerichtet", score: 4 },
              { text: "Die Problembearbeitung erfolgte äußerst zielgerichtet und selbstständig", score: 5 }
            ]
          },
          methodology: {
            title: "Methodisches Vorgehen",
            weight: 0.3,
            options: [
              { text: "Lösungsstrategien wurden kaum eigenständig erarbeitet", score: 1 },
              { text: "Lösungsstrategien wurden teilweise eigenständig erarbeitet, benötigten aber häufige Anpassungen", score: 2 },
              { text: "Lösungsstrategien wurden meist eigenständig erarbeitet", score: 3 },
              { text: "Lösungsstrategien wurden eigenständig erarbeitet und gut umgesetzt", score: 4 },
              { text: "Lösungsstrategien und Ansätze wurden durchweg eigenständig erarbeitet, angewendet sowie klar nachvollziehbar präsentiert", score: 5 }
            ]
          },
          implementation: {
            title: "Praktische Umsetzung",
            weight: 0.4,
            options: [
              { text: "Die praktische Implementierung weist grundlegende Mängel auf und erfüllt die Anforderungen nur unzureichend", score: 1 },
              { text: "Die praktische Implementierung erfüllt die grundlegenden Anforderungen, zeigt aber Optimierungspotential in Architektur und Code-Qualität", score: 2 },
              { text: "Die praktische Implementierung ist solide umgesetzt mit angemessener Architektur und guter Code-Qualität", score: 3 },
              { text: "Die praktische Implementierung überzeugt durch durchdachte Architektur, sehr gute Code-Qualität und effiziente Problemlösung", score: 4 },
              { text: "Die praktische Implementierung ist sehr gut strukturiert mit durchdachter Architektur, sauberem, wartbarem Code und zeigt fundiertes technisches Verständnis", score: 5 }
            ]
          }
        }
      },
      form: {
        title: "Form der Arbeit",
        weight: 0.3,
        criteria: {
          approach: {
            title: "Wissenschaftliches Vorgehen & Fokus",
            weight: 0.15,
            options: [
              { text: "Die Bearbeitung folgt keinem klaren wissenschaftlichen Vorgehen", score: 1 },
              { text: "Die Bearbeitung folgt einem wissenschaftlichen Vorgehen", score: 2 },
              { text: "Die Bearbeitung folgt einem wissenschaftlichen Vorgehen", score: 3 },
              { text: "Die Bearbeitung folgt einem klaren wissenschaftlichen Vorgehen", score: 4 },
              { text: "Die Bearbeitung folgt einem klaren wissenschaftlichen Vorgehen zur Beantwortung der Fragestellung", score: 5 }
            ]
          },
          research_question: {
            title: "Fragestellung und Methodik",
            weight: 0.15,
            options: [
              { text: "Die Fragestellung ist nicht erkennbar, die Methodik wird nicht beschrieben", score: 1 },
              { text: "Die Fragestellung ist ansatzweise erkennbar, die Methodik wird oberflächlich beschrieben", score: 2 },
              { text: "Die Fragestellung ist erkennbar und die Methodik wird beschrieben", score: 3 },
              { text: "Die Fragestellung ist gut herausgestellt und die Methodik wird klar beschrieben", score: 4 },
              { text: "Die Fragestellung ist klar herausgestellt und die Methodik wird umfassend umrissen", score: 5 }
            ]
          },
          related_work: {
            title: "Related Work",
            weight: 0.1,
            options: [
              { text: "Related Work fehlt vollständig", score: 1 },
              { text: "Related Work ist oberflächlich und zeigt wenig Bezug zur eigenen Arbeit", score: 2 },
              { text: "Related Work ist vorhanden und zeigt Bezüge zur eigenen Arbeit", score: 3 },
              { text: "Related Work ist gut ausgearbeitet und wird in Bezug zur eigenen Arbeit diskutiert", score: 4 },
              { text: "Related Work ist umfassend ausgearbeitet, klar strukturiert und wird kritisch in Bezug zur eigenen Arbeit diskutiert", score: 5 }
            ]
          },
          fundamentals: {
            title: "Grundlagen",
            weight: 0.1,
            options: [
              { text: "Die Grundlagen sind unzureichend und ohne erkennbaren Bezug zum Thema", score: 1 },
              { text: "Die Grundlagen sind knapp dargestellt mit schwachem Bezug zum Thema", score: 2 },
              { text: "Die Grundlagen sind ausreichend dargestellt mit erkennbarem Bezug zum Thema", score: 3 },
              { text: "Die Grundlagen sind umfassend dargestellt mit klarem Bezug zum Thema", score: 4 },
              { text: "Die Grundlagen sind sehr gut aufgearbeitet, fokussiert und bilden eine solide Basis für die weitere Arbeit", score: 5 }
            ]
          },
          source_usage: {
            title: "Quellenarbeit",
            weight: 0.1,
            options: [
              { text: "Quellen werden kaum verwendet, die Zitierung ist fehlerhaft", score: 1 },
              { text: "Quellen werden verwendet, die Zitierung weist häufig Mängel auf", score: 2 },
              { text: "Quellen werden angemessen verwendet, die Zitierung ist größtenteils korrekt", score: 3 },
              { text: "Unterschiedliche Quellen werden gut verwendet, die Zitierung ist überwiegend sauber", score: 4 },
              { text: "Unterschiedliche und geeignete Quellen werden verwendet, deren Auswahl nachvollziehbar und gut aufgearbeitet ist. Die Zitierung erfolgt durchgehend sauber", score: 5 }
            ]
          },
          implementation: {
            title: "Durchführung und Darstellung",
            weight: 0.2,
            options: [
              { text: "Die Durchführung ist unverständlich, der Versuchsaufbau unklar", score: 1 },
              { text: "Die Durchführung ist teilweise verständlich, der Versuchsaufbau oberflächlich beschrieben", score: 2 },
              { text: "Die Durchführung ist nachvollziehbar, der Versuchsaufbau ausreichend beschrieben", score: 3 },
              { text: "Die Durchführung ist gut verständlich, der Versuchsaufbau klar dargestellt", score: 4 },
              { text: "Die Durchführung umfasst eine verständliche Darstellung des Versuchsaufbaus und der -durchführung, insbesondere für die Lösungsstrategien und deren Umsetzung", score: 5 }
            ]
          },
          evaluation: {
            title: "Evaluation und Nachvollziehbarkeit",
            weight: 0.2,
            options: [
              { text: "Die Evaluation ist nicht nachvollziehbar, Vergleichskriterien fehlen", score: 1 },
              { text: "Die Evaluation ist teilweise nachvollziehbar, Vergleichskriterien sind oberflächlich", score: 2 },
              { text: "Die Evaluation ist nachvollziehbar, Vergleichskriterien sind vorhanden", score: 3 },
              { text: "Die Evaluation ist gut nachvollziehbar, Vergleichskriterien sind definiert", score: 4 },
              { text: "Die Evaluation ist argumentativ aufgebaut und sehr gut nachvollziehbar, Vergleichskriterien sind strukturiert hergeleitet", score: 5 }
            ]
          }
        }
      },
      structure: {
        title: "Gliederung",
        weight: 0.2,
        criteria: {
          structure_logic: {
            title: "Struktureller Aufbau",
            weight: 0.4,
            options: [
              { text: "Die Gliederung ist unübersichtlich und folgt keiner erkennbaren Logik. Zentrale Aspekte der Arbeit spiegeln sich nicht in der Struktur wider", score: 1 },
              { text: "Die Gliederung zeigt eine grundlegende Struktur, aber mit schwacher logischer Verknüpfung der Kapitel. Der rote Faden ist nur teilweise erkennbar", score: 2 },
              { text: "Die Gliederung ist nachvollziehbar aufgebaut mit erkennbarer Progression von Grundlagen über Hauptteil zur Auswertung. Die Kapitel bauen logisch aufeinander auf", score: 3 },
              { text: "Die Gliederung ist gut durchdacht mit klarer thematischer Entwicklung. Die Kapitel sind sinnvoll verknüpft und führen zielgerichtet durch die Arbeit", score: 4 },
              { text: "Die Gliederung zeigt eine sehr schlüssige Struktur und durchgängige thematische Entwicklung. Die Kapitel sind gut verzahnt und bilden einen klaren Argumentationsfluss von der Einleitung bis zum Fazit", score: 5 }
            ]
          },
          depth_balance: {
            title: "Gliederungstiefe und Gewichtung",
            weight: 0.3,
            options: [
              { text: "Die Gliederungstiefe ist stark unausgewogen. Wichtige Bereiche sind zu oberflächlich, während nebensächliche Aspekte übermäßig untergliedert sind", score: 1 },
              { text: "Die Gliederungstiefe zeigt Ungleichgewichte. Die Gewichtung der Kapitel entspricht nicht durchgängig ihrer inhaltlichen Bedeutung", score: 2 },
              { text: "Die Gliederungstiefe ist angemessen mit weitgehend ausgewogener Behandlung der verschiedenen Themenbereiche", score: 3 },
              { text: "Die Gliederungstiefe ist gut gewählt mit klarem Fokus auf den relevanten Aspekten. Die Gewichtung der Kapitel spiegelt ihre Bedeutung wider", score: 4 },
              { text: "Die Gliederungstiefe ist durchgängig angemessen mit sehr guter Balance zwischen allen Arbeitsteilen. Die Untergliederung folgt konsequent der inhaltlichen Relevanz", score: 5 }
            ]
          },
          formal_quality: {
            title: "Formale Qualität",
            weight: 0.3,
            options: [
              { text: "Die formale Umsetzung weist erhebliche Mängel auf. Nummerierung inkonsistent, Überschriften unpräzise, Gliederungsebenen unklar", score: 1 },
              { text: "Die formale Umsetzung zeigt mehrere Schwächen. Teilweise inkonsistente Formulierungen oder unklare Hierarchien in den Gliederungsebenen", score: 2 },
              { text: "Die formale Umsetzung ist solide. Durchgängig korrekte Nummerierung, nachvollziehbare Überschriften und klare Gliederungsebenen", score: 3 },
              { text: "Die formale Umsetzung ist sehr gut. Präzise Kapitelbezeichnungen, konsistente Formatierung und gut abgestimmte Gliederungsebenen", score: 4 },
              { text: "Die formale Umsetzung ist durchgängig sorgfältig. Überschriften sind präzise und aussagekräftig, die Formatierung einheitlich und die Gliederungsebenen gut differenziert", score: 5 }
            ]
          }
        }
      },
      content: {
        title: "Inhalt",
        weight: 0.3,
        criteria: {
          argumentation: {
            title: "Argumentationsverlauf und Fragestellung",
            weight: 0.25,
            options: [
              { text: "Der Argumentationsverlauf ist unklar, Fragestellungen werden nicht verfolgt", score: 1 },
              { text: "Der Argumentationsverlauf ist teilweise nachvollziehbar, Fragestellungen werden oberflächlich behandelt", score: 2 },
              { text: "Der Argumentationsverlauf ist nachvollziehbar, Fragestellungen werden ausreichend verfolgt", score: 3 },
              { text: "Der Argumentationsverlauf ist gut nachvollziehbar, Fragestellungen werden systematisch verfolgt", score: 4 },
              { text: "Der Argumentationsverlauf ist klar und sehr gut nachvollziehbar, Fragestellungen werden durchgängig verfolgt und die notwendigen Betrachtungen verständlich präsentiert", score: 5 }
            ]
          },
          basics: {
            title: "Grundlagen",
            weight: 0.25,
            options: [
              { text: "Die Grundlagen haben keinen erkennbaren Bezug zum Thema", score: 1 },
              { text: "Die Grundlagen sind nur teilweise im Kontext der Arbeit relevant", score: 2 },
              { text: "Die Grundlagen bewegen sich im Kontext der Arbeit und sind nachvollziehbar", score: 3 },
              { text: "Die Grundlagen sind gut gewählt, nachvollziehbar und hilfreich für die weiteren Kapitel", score: 4 },
              { text: "Die gewählten Grundlagen bewegen sich optimal im Kontext der Themen, sind sehr gut nachvollziehbar und besonders hilfreich in Bezug zu den folgenden Kapiteln", score: 5 }
            ]
          },
          evaluation: {
            title: "Evaluation und Diskussion",
            weight: 0.25,
            options: [
              { text: "Die Evaluation fehlt weitgehend, keine erkennbare Diskussion", score: 1 },
              { text: "Die Evaluation ist oberflächlich, die Diskussion wenig aussagekräftig", score: 2 },
              { text: "Die Evaluation ist nachvollziehbar, die Diskussion behandelt die wichtigsten Punkte", score: 3 },
              { text: "Die Evaluation erfolgt systematisch, die Diskussion ist gut ausgearbeitet", score: 4 },
              { text: "Die Evaluation erfolgt sehr systematisch und ist überzeugend nachvollziehbar, die Diskussion wird umfassend geführt und berücksichtigt alle relevanten Ergebnisse und Fragestellungen", score: 5 }
            ]
          },
          complexity: {
            title: "Technische Komplexität und Verständnis",
            weight: 0.25,
            options: [
              { text: "Die Arbeit zeigt nur oberflächliches Verständnis der behandelten Technologien", score: 1 },
              { text: "Die Arbeit behandelt wenige Technologien mit grundlegendem Verständnis", score: 2 },
              { text: "Die Arbeit behandelt verschiedene Technologien mit gutem Verständnis", score: 3 },
              { text: "Die Arbeit adressiert viele Technologien mit sehr gutem Verständnis", score: 4 },
              { text: "Die Arbeit adressiert viele unterschiedliche Technologien und Aspekte, die durchgängig beherrscht und verstanden werden, und unterstreicht damit die hohe Komplexität der Arbeit", score: 5 }
            ]
          }
        }
      }
    }
  } as const;