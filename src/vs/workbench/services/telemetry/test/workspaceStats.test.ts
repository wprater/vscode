/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { WorkspaceStats } from 'vs/workbench/services/telemetry/common/workspaceStats';

suite('Telemetry - WorkspaceStats', () => {

	const whitelist = [
		'github.com',
		'github2.com',
		'github3.com',
		'example.com',
		'example2.com',
		'example3.com',
		'server.org',
		'server2.org',
	];

	test('HTTPS remotes', function () {
		const stats = new WorkspaceStats(null, null, null);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://github.com/Microsoft/vscode.git'), whitelist), ['github.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://git.example.com/gitproject.git'), whitelist), ['example.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://username@github2.com/username/repository.git'), whitelist), ['github2.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://username:password@github3.com/username/repository.git'), whitelist), ['github3.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://username:password@example2.com:1234/username/repository.git'), whitelist), ['example2.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('https://example3.com:1234/username/repository.git'), whitelist), ['example3.com']);
	});

	test('SSH remotes', function () {
		const stats = new WorkspaceStats(null, null, null);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('ssh://user@git.server.org/project.git'), whitelist), ['server.org']);
	});

	test('SCP-like remotes', function () {
		const stats = new WorkspaceStats(null, null, null);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('git@github.com:Microsoft/vscode.git'), whitelist), ['github.com']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('user@git.server.org:project.git'), whitelist), ['server.org']);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('git.server2.org:project.git'), whitelist), ['server2.org']);
	});

	test('Local remotes', function () {
		const stats = new WorkspaceStats(null, null, null);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('/opt/git/project.git'), whitelist), []);
		assert.deepStrictEqual(stats.getDomainsOfRemotes(remote('file:///opt/git/project.git'), whitelist), []);
	});

	test('Multiple remotes', function () {
		const stats = new WorkspaceStats(null, null, null);
		const config = ['https://github.com/Microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join('');
		assert.deepStrictEqual(stats.getDomainsOfRemotes(config, whitelist).sort(), ['example.com', 'github.com']);
	});

	test('Whitelisting', function () {
		const stats = new WorkspaceStats(null, null, null);
		const config = ['https://github.com/Microsoft/vscode.git', 'https://git.foobar.com/gitproject.git'].map(remote).join('');
		assert.deepStrictEqual(stats.getDomainsOfRemotes(config, whitelist).sort(), ['aaaaaa.aaa', 'github.com']);
	});

	function remote(url: string): string {
		return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
	}
});