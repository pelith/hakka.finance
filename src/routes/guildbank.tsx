import { createFileRoute } from '@tanstack/react-router';
import GuildBankPage from '../pages/guildbank';

export const Route = createFileRoute('/guildbank')({
  component: GuildBankPage,
});
