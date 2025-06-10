# Strong Medicine - AI Medical Screening Tool

A chat-based AI medical screening tool that collects patient demographics, symptoms, and medical history to generate comprehensive health reports with specialist recommendations.

## Features

- **Conversational Interface**: Natural chat flow for collecting patient information
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent follow-up questions and analysis
- **Progress Tracking**: Visual progress indicators through the screening stages
- **Comprehensive Reports**: PDF generation with functional medicine insights
- **Privacy Focused**: Temporary data storage with encryption
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, OpenAI API
- **PDF Generation**: jsPDF
- **Styling**: Tailwind CSS with custom design system matching main site

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3001`

## Deployment

### Subdomain Setup (chat.strongmedicine.com)

1. **DNS Configuration**
   - Add CNAME record: `chat` → `your-deployment-url.vercel.app`

2. **Vercel Deployment**
   ```bash
   # Deploy to Vercel
   vercel --prod
   
   # Add custom domain
   vercel domains add chat.strongmedicine.com
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_MAIN_SITE_URL=https://strongmedicine.com`

## API Endpoints

### POST /api/chat
Processes chat messages and updates patient data.

**Request:**
```json
{
  "message": "I'm 35 years old and female",
  "patientData": {...},
  "messageHistory": [...],
  "currentStage": "demographics"
}
```

**Response:**
```json
{
  "message": "Thank you. What symptoms have you been experiencing?",
  "updatedPatientData": {...},
  "progress": 25,
  "currentStage": "symptoms"
}
```

### POST /api/generate-report
Generates PDF health screening report.

**Request:**
```json
{
  "patientData": {...},
  "messageHistory": [...]
}
```

**Response:**
PDF file download

## Screening Stages

1. **Demographics** (20% progress)
   - Age, gender, location, occupation

2. **Symptoms** (25% progress)
   - Current symptoms, duration, severity

3. **Medical History** (20% progress)
   - Past conditions, family history, treatments

4. **Lifestyle** (25% progress)
   - Diet, exercise, sleep, stress levels

5. **Analysis** (10% progress)
   - AI analysis and report generation

## Data Privacy

- No persistent storage of patient data
- Session-based data collection
- HIPAA-compliant practices
- Secure API communication
- Data encryption in transit

## Customization

### Styling
The design system matches the main Strong Medicine website:
- Colors: Accent green (#10b981), Primary blue (#0ea5e9)
- Typography: Inter font family
- Components: Matching card styles, buttons, and layouts

### AI Prompts
Modify the system prompts in `/src/app/api/chat/route.ts` to adjust:
- Question flow and style
- Medical focus areas
- Analysis framework

### Report Format
Customize PDF generation in `/src/app/api/generate-report/route.ts`:
- Layout and styling
- Sections and content
- Branding elements

## Integration with Main Site

The tool can be embedded or linked from the main Strong Medicine website:

```html
<!-- Link to screening tool -->
<a href="https://chat.strongmedicine.com" target="_blank">
  Start Health Screening
</a>

<!-- Embed as iframe -->
<iframe 
  src="https://chat.strongmedicine.com" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

## Support

For technical support or customization requests, contact the development team.