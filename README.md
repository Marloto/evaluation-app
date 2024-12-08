# Thesis Evaluation Tool

A web-based application for evaluating academic theses using predefined text modules and weighted scoring criteria. This tool helps evaluators assess theses across four main categories: Preface, Form, Structure, and Content, ultimately providing a grade recommendation based on weighted selections.

## Features

- 📝 Structured evaluation across four main categories
- 🔤 Predefined text modules for consistent evaluation
- ⚖️ Weighted scoring system
- 📊 Real-time grade calculation
- 📈 Visual analytics and progress tracking
- 💾 Save and load evaluation templates
- 📑 Rich text notes support
- 🖨️ Print-friendly criteria overview
- 🎨 Clean, modern UI built with shadcn/ui

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TipTap
- DnD Kit
- Recharts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thesis-evaluation-tool.git
```

2. Install dependencies:
```bash
cd thesis-evaluation-tool
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Usage

1. Select or create an evaluation template
2. Navigate through the four main categories:
   - Preface
   - Form
   - Structure
   - Content
3. Select appropriate criteria and ratings for each section
4. Add custom notes and text as needed
5. Review the automatically calculated grade recommendation
6. Export or save your evaluation

## Configuration

The tool supports custom configuration for:
- Evaluation criteria and weights
- Grading thresholds
- Text modules
- Templates

See the `lib/config` directory for configuration files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- GitHub Issues: https://github.com/marloto/project/issues
- GitHub Discussions: https://github.com/marloto/project/discussions
- Project Website: https://project.example.com