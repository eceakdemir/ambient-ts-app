import { useEffect, useRef /* useState */ } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';

interface AxisIF {
    data: number[];
    scale: d3.ScaleLinear<number, number> | undefined;
    afterOneWeek: boolean;
    axisColor: string;
    textColor: string;
    showDayCount: number;
}
export default function Xaxis(props: AxisIF) {
    const d3XaxisRef = useRef<HTMLInputElement | null>(null);
    const { data, scale, afterOneWeek, axisColor, textColor, showDayCount } =
        props;

    useEffect(() => {
        if (scale) {
            const xAxis = d3
                .axisBottom(scale)
                .tickValues(
                    afterOneWeek
                        ? d3.range(0, 1441, 60)
                        : d3.range(
                              0,
                              scale.domain()[0],
                              showDayCount > 7 ? 1441 : 1441 / 2,
                          ),
                )
                .tickFormat((d) => {
                    const hour = d.valueOf() / (afterOneWeek ? 60 : 1441);
                    if (
                        Number.isInteger(d) &&
                        (showDayCount > 7 ? hour % 2 === 0 : true)
                    ) {
                        return hour.toString() + 'd';
                    }

                    return '';
                });

            const d3LinearAxisJoin = d3fc.dataJoin('g', 'd3-axis-linear');
            d3.select(d3XaxisRef.current).on('draw', () => {
                const svg = d3.select(d3XaxisRef.current).select('svg');
                svg.select('g')
                    .selectAll('path, line')
                    .attr('stroke', axisColor);
                svg.select('g')
                    .selectAll('text')
                    .attr('fill', textColor)
                    .style('font-family', 'Roboto Mono');

                svg.on('mouseover', function () {
                    d3.select(this)
                        .selectAll('path, line')
                        .attr('stroke', 'var(--accent1)');

                    d3.select(this)
                        .selectAll('text')
                        .attr('fill', 'var(--accent1)');
                }).on('mouseout', function () {
                    d3.select(this)
                        .selectAll('path, line')
                        .attr('stroke', axisColor);

                    d3.select(this).selectAll('text').attr('fill', textColor);
                });

                d3LinearAxisJoin(svg, [data]).call(xAxis);
            });
        }

        renderCanvasArray([d3XaxisRef]);
    }, [scale, d3XaxisRef]);

    return (
        <d3fc-svg
            ref={d3XaxisRef}
            style={{
                gridColumnStart: 2,
                gridColumnEnd: 4,
                gridRowStart: 2,
                gridRowEnd: 4,
                height: '100%',
                width: '100%',
            }}
        ></d3fc-svg>
    );
}
