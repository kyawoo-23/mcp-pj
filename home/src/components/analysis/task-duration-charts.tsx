"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Clock, Timer, Users } from "lucide-react";
import { SystemTypes, getSystemTypeLabel } from "@/lib/constants";
import { type SystemDurationData } from "@/lib/analysis-calculations";
import { TASK_ORDER } from "@/utils/constants";

const taskOrder = (taskCode: string) => TASK_ORDER[taskCode] ?? 999;

type TaskDurationChartsProps = {
  durations: SystemDurationData[];
};

export function TaskDurationCharts({ durations }: TaskDurationChartsProps) {
  // Prepare data for grouped bar chart - comparing tasks across systems
  const chartData = useMemo(() => {
    if (durations.length < 2) return [];

    const chatSystem = durations.find((d) => d.systemType === "chat_agent");
    const traditionalSystem = durations.find(
      (d) => d.systemType === "traditional",
    );

    if (!chatSystem || !traditionalSystem) return [];

    const sortedChat = [...chatSystem.tasks].sort(
      (a, b) => taskOrder(a.taskCode) - taskOrder(b.taskCode),
    );
    const sortedTrad = [...traditionalSystem.tasks].sort(
      (a, b) => taskOrder(a.taskCode) - taskOrder(b.taskCode),
    );

    const maxTasks = Math.max(sortedChat.length, sortedTrad.length);
    const data = [];
    for (let i = 0; i < maxTasks; i++) {
      const chatTask = sortedChat[i];
      const tradTask = sortedTrad[i];

      data.push({
        taskLabel: `Task ${i + 1}`,
        taskTitle:
          chatTask?.taskTitle || tradTask?.taskTitle || `Task ${i + 1}`,
        chat: chatTask?.avgDurationMs ? chatTask.avgDurationMs / 1000 / 60 : 0, // Convert to minutes
        traditional: tradTask?.avgDurationMs
          ? tradTask.avgDurationMs / 1000 / 60
          : 0,
        chatFormatted: chatTask?.avgDurationFormatted || "N/A",
        traditionalFormatted: tradTask?.avgDurationFormatted || "N/A",
        chatCount: chatTask?.completedCount || 0,
        traditionalCount: tradTask?.completedCount || 0,
      });
    }

    return data;
  }, [durations]);

  const chartConfig: ChartConfig = {
    chat: {
      label: SystemTypes.chat_agent,
      color: "var(--chat)",
    },
    traditional: {
      label: SystemTypes.traditional,
      color: "var(--traditional)",
    },
  };

  return (
    <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
      {/* Individual System Cards */}
      {durations.map((system) => (
        <Card key={system.systemType} className='overflow-hidden'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>
                {getSystemTypeLabel(system.systemType)}
              </CardTitle>
              <Badge
                variant='outline'
                className='flex items-center gap-1.5 px-2.5 py-1'
              >
                <Timer className='h-3.5 w-3.5' />
                <span className='font-semibold'>
                  {system.overallAvgDurationFormatted}
                </span>
              </Badge>
            </div>
            <CardDescription>Average task completion time</CardDescription>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='space-y-3'>
              {[...system.tasks]
                .sort((a, b) => taskOrder(a.taskCode) - taskOrder(b.taskCode))
                .map((task, index) => (
                <div
                  key={task.taskCode}
                  className='flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                      {index + 1}
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium leading-tight'>
                        {task.taskTitle}
                      </span>
                      <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Users className='h-3 w-3' />
                        {task.completedCount} completed
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 text-right'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span
                      className={`font-mono text-sm font-semibold ${
                        task.avgDurationFormatted === "N/A"
                          ? "text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.avgDurationFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Duration Comparison</CardTitle>
          <CardDescription>Average completion time per task</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='taskLabel'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value.toFixed(0)}m`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(_value, name, props) => {
                      const data = props.payload as (typeof chartData)[0];
                      const systemKey = name as "chat" | "traditional";
                      const formatted =
                        systemKey === "chat"
                          ? data.chatFormatted
                          : data.traditionalFormatted;
                      const count =
                        systemKey === "chat"
                          ? data.chatCount
                          : data.traditionalCount;
                      return [
                        `${formatted} (n=${count}) `,
                        systemKey === "chat"
                          ? SystemTypes.chat_agent
                          : SystemTypes.traditional,
                      ];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload as
                        | (typeof chartData)[0]
                        | undefined;
                      return data?.taskTitle || label;
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey='chat' fill='var(--color-chat)' radius={4} />
              <Bar
                dataKey='traditional'
                fill='var(--color-traditional)'
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
