import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DB_ID;

export async function findUserByEmail(email) {
  const res = await notion.databases.query({
    database_id: DB_ID,
    filter: { property: 'Email', email: { equals: email } }
  });
  const page = res.results[0];
  return page ? toUser(page) : null;
}

export async function createUser({ name, company, email, password_hash, report_url }) {
  const res = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: {
      Name: { title: [{ type: 'text', text: { content: name } }] },
      Email: { email },
      Company: { rich_text: [{ type: 'text', text: { content: company } }] },
      PasswordHash: { rich_text: [{ type: 'text', text: { content: password_hash } }] },
      ReportURL: { url: report_url }
    }
  });
  return toUser(res);
}

function toUser(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: p.Name?.title?.[0]?.plain_text || '',
    email: p.Email?.email || '',
    company: p.Company?.rich_text?.[0]?.plain_text || '',
    password_hash: p.PasswordHash?.rich_text?.[0]?.plain_text || '',
    report_url: p.ReportURL?.url || ''
  };
}
