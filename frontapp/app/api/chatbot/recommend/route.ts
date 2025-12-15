import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

function parseBudget(budgetRaw: string | null): [number, number] {
    const b = (budgetRaw ?? '').trim()
    const INF = 999_999_999

    switch (b) {
        case '3만 원 이하':
            return [0, 30000]
        case '3만 ~ 5만 원':
            return [30000, 50000]
        case '5만 ~ 10만 원':
            return [50000, 100000]
        case '10만 원 이상':
            return [100000, INF]
        case '예산 상관없음':
        case '':
        default:
            return [0, INF]
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        const budget = searchParams.get('budget')
        const limitRaw = searchParams.get('limit')
        const limit = Math.min(parseInt(limitRaw ?? '3', 10) || 3, 10)

        const [minPrice, maxPrice] = parseBudget(budget)

        const sql = `
      SELECT name, category, price, slug
      FROM product
      WHERE price BETWEEN $1 AND $2
      ORDER BY created_at DESC NULLS LAST, id DESC
      LIMIT $3
    `
        const { rows } = await pool.query(sql, [minPrice, maxPrice, limit])

        const baseUrl = process.env.PUBLIC_BASE_URL ?? 'https://gongyedam.com'

        const products = rows.map((r: any) => ({
            name: r.name,
            category: r.category,
            price: r.price,
            url: `${baseUrl}/product/${r.slug}`,
        }))

        return NextResponse.json({ products })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'internal_error' }, { status: 500 })
    }
}
