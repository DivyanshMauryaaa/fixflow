import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
// Accept installation_id from query or env
// const installationId = process.env.GITHUB_INSTALLATION_ID;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const path = searchParams.get('path') || '';
  const installationId = searchParams.get('installation_id');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }
  if (!installationId) {
    return NextResponse.json({ error: 'Missing installation_id' }, { status: 400 });
  }

  try {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appId!,
        privateKey: privateKey!,
        installationId: installationId!,
      },
    });

    // Fetch repo contents (file/folder structure)
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}